import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { QuizQuestion } from "../types/study";


function useQuiz()
{
    const [quizQuestionsByMaterial, setQuizQuestionsByMaterial] = useState<Record<string, QuizQuestion[]>>({});
    const [generatingQuizIds, setGeneratingQuizIds] = useState<Set<string>>(new Set());
    const [quizIndexes, setQuizIndexes] = useState<Record<string, number>>({});
    const [quizAnswersByMaterial, setQuizAnswersByMaterial] = useState<Record<string, Record<string, number>>>({});
    const [quizScore, setQuizScore] = useState<Record<string, number>>({});
    const [quizError, setQuizErrors] = useState<Record<string, string>>({}); 
    const { session } = useAuth();

    async function loadQuizQuestions(materialIds: string[])
    {
        if(materialIds.length === 0)
        {
            setQuizQuestionsByMaterial({});
            return;
        }

        const {data, error} = await supabase
        .from("quiz_questions")
        .select("id, study_material_id, question, options, correct_option, position")
        .in("study_material_id", materialIds)
        .order("position", { ascending: true });

        if(error)
        {
            console.error(error);
            return;
        }

        const groupedQuizQuestions: Record<string, QuizQuestion[]> = {};

        data.forEach((question) => {
            if (!groupedQuizQuestions[question.study_material_id])
            {
                groupedQuizQuestions[question.study_material_id] = [];
            }
            groupedQuizQuestions[question.study_material_id].push(question);
        });

        setQuizQuestionsByMaterial(groupedQuizQuestions);
    }


    async function generateQuiz(materialId: string)
    {
        if(!session)
        {
            console.error("No session");
            return;
        }

        setGeneratingQuizIds((prev) => {
            const next = new Set(prev);
            next.add(materialId);
            return next;
        });

        setQuizErrors((prev) => {
            const next = { ...prev };
            delete next[materialId];
            return next;
        });

        try
        {
            const url = `http://localhost:3000/api/materials/${materialId}/quiz`;

            const response = await fetch(url ,{
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            const data = await response.json();

            if(!response.ok)
            {
                console.error(data.error);

                setQuizErrors((prev) => ({
                    ...prev,
                    [materialId]: data.error,    
                }));
                return;
            }


            setQuizQuestionsByMaterial((prev) => ({
                ...prev,
                [materialId]: data.questions,
            }));

            setQuizIndexes((prev) => ({
                ...prev,
                [materialId]: 0,
            }));

            setQuizAnswersByMaterial((prev) => ({
                ...prev,
                [materialId]: {},
            }));

            setQuizScore((prev) => {
                const next = { ...prev };
                delete next[materialId];
                return next;
            });
        }
        catch (error)
        {
            console.error(error);
            setQuizErrors((prev) => ({
                ...prev,
                [materialId]: "Could not connect to the server",    
            }));
        }
        finally
        {
            setGeneratingQuizIds((prev) => {
                const next = new Set(prev);
                next.delete(materialId);
                return next;
            });
        }

    }

    function selectAnswer(materialId: string, questionId: string, optionIndex: number)
    {
        setQuizAnswersByMaterial((prev) => ({
            ...prev,
            [materialId]: {
                ...prev[materialId],
                [questionId]: optionIndex,
            },
        }));
    }    

    function retryQuiz(materialId: string)
    {
        setQuizScore((prev) => {
            const next = {...prev};
            delete next[materialId];
            return next;
        });

        setQuizAnswersByMaterial((prev) => ({
            ...prev,
            [materialId]: {},
        }));

        setQuizIndexes((prev) => ({
            ...prev,
            [materialId]: 0,
        }));
    }

    function previousQuestion(materialId: string)
    {
        setQuizIndexes((prev) => ({
            ...prev, 
            [materialId]: (prev[materialId] ?? 0) - 1,
        }));
    }

    function nextQuestion(materialId: string)
    {
        setQuizIndexes((prev) => ({
            ...prev, 
            [materialId]: (prev[materialId] ?? 0) + 1,
        }));
    }

    function submitQuiz(materialId: string)
    {   
        const questions = quizQuestionsByMaterial[materialId];
        if (!questions) return;

        let score = 0;
        questions.forEach((question) => {
            if(question.correct_option === quizAnswersByMaterial[materialId]?.[question.id])
            {
                score += 1;
            }
        })

        setQuizScore((prev) => ({
            ...prev,
            [materialId]: score
        }));
    }

    return {
        quizQuestionsByMaterial,
        generatingQuizIds,
        quizIndexes,
        quizAnswersByMaterial,
        quizScore,
        quizError,
        loadQuizQuestions,
        generateQuiz,
        selectAnswer,
        retryQuiz,
        previousQuestion,
        nextQuestion,
        submitQuiz,
    };
}

export default useQuiz;