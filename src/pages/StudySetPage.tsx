import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ExplanationMode from "../components/study/ExplanationMode";
import FlashcardsMode from "../components/study/FlashcardsMode";
import QuizMode from "../components/study/QuizMode";
import useExplanation from "../hooks/useExplanation";
import useFlashcards from "../hooks/useFlashcards";
import type { StudySet, StudyMaterial} from "../types/study";
import useQuiz from "../hooks/useQuiz";
import StudyMaterialCard from "../components/study/StudyMaterialCard";


function StudySetPage()
{
    const [studySet, setStudySet] = useState<StudySet | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);

    const 
    {
        explanations,
        explainingIds,
        explainErrors,
        explainMaterial,
        loadSavedExplanations,
    } = useExplanation();

    const 
    {
        flashcardsByMaterial,
        generatingFlashcardIds,
        flashcardErrors,
        flashcardIndexes,
        shownAnswerIds,
        loadFlashcards,
        generateFlashcards,
        showAnswer,
        previousCard,
        nextCard,
    } = useFlashcards();

    const 
    {
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
    } = useQuiz();


    const { id } = useParams();
    const { session } = useAuth();

    async function extractMaterial(materialId: string) 
    {
        if(!session)
        {
            console.error("No session");
            return;
        }

        const url = `http://localhost:3000/api/materials/${materialId}/extract`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        const data = await response.json();
        console.log(data);
    }

    async function loadStudySet() 
    {
        setLoading(true);
        setStudySet(null);

        if(!id)
        {
            setLoading(false);
            return;
        }

        const {data, error} = await supabase
        .from("study_sets")
        .select("id, title")
        .eq("id", id)
        .maybeSingle();
        
        if(error)
        {
            console.error(error.message);
            setLoading(false);
            return;
        }

        setStudySet(data);
        setLoading(false);

    }

    async function uploadMaterial()
    {
        if(!selectedFile || !id)
        {
            return;
        }
        const path = id + "/" + crypto.randomUUID() + ".pdf";

        const {error: errorStorage} = await supabase.storage
        .from("study-materials")
        .upload(path, selectedFile);

        if(errorStorage)
        {
            console.error(errorStorage);
            return;
        }
        console.log("Storage Upload successful");

        const {data: newMaterial, error: errorTable} = await supabase
        .from("study_materials")
        .insert({
            study_set_id: id,
            file_name: selectedFile.name,
            storage_path: path,
            mime_type: selectedFile.type, 
        })
        .select("id")
        .single();

        if(errorTable)
        {
            const {error: errorRemove} = await supabase.storage
            .from("study-materials")
            .remove([path]);

            if(errorRemove)
            {
                console.error(errorRemove);
            }
            console.error(errorTable);
            return;
        }

        await extractMaterial(newMaterial.id);
        console.log("Table Upload successful");
        await loadMaterials();
        setSelectedFile(null);
    }

    async function loadMaterials()
    {
        const{data, error} = await supabase
        .from("study_materials")
        .select("id, file_name, storage_path, mime_type, explanation")
        .eq("study_set_id", id)
        .order("created_at", { ascending: true });

        if(error)
        {
            console.error(error);
            return;
        }

        setMaterials(data);
        loadSavedExplanations(data);

        const materialIds = data.map((material) => material.id);
        await loadFlashcards(materialIds)
        await loadQuizQuestions(materialIds)

        
    }


    useEffect(() => {
        loadStudySet();
        loadMaterials();
    }, [id]);




    if (loading) 
    {
        return <p>Loading...</p>;
    }

    if (!studySet) 
    {
        return <p>Study set not found.</p>;
    }


    return (
        <>
            <h1>{studySet.title}</h1>
            <input type="file" accept="application/pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}></input>
            <button onClick={uploadMaterial}>Upload</button>
            <h3>Study Set ID: {id}</h3>
            <h4>Materials</h4>
            {materials.length === 0 && <p>No materials uploaded yet.</p>}

            {materials.map((material) => {

                const cards = flashcardsByMaterial[material.id];
                const currentIndex = flashcardIndexes[material.id] ?? 0;
                
                const quizQuestions = quizQuestionsByMaterial[material.id];
                const currentQuizIndex = quizIndexes[material.id] ?? 0;
                const currentQuizQuestion = quizQuestions?.[currentQuizIndex];  
                const selectedQuizAnswer = currentQuizQuestion ? quizAnswersByMaterial[material.id]?.[currentQuizQuestion.id] : undefined;
                

                return(
                    <StudyMaterialCard
                        key={material.id} 
                        fileName={material.file_name}
                        explanationContent=
                        {
                            <ExplanationMode
                                explanation={explanations[material.id]}
                                isGenerating={explainingIds.has(material.id)}
                                error={explainErrors[material.id]}
                                onGenerate={() => explainMaterial(material.id)}
                            />
                        }
                        flashcardsContent=
                        {
                            <FlashcardsMode 
                                cards={cards}
                                currentIndex={currentIndex}
                                isAnswerShown={shownAnswerIds.has(material.id)}
                                isGenerating={generatingFlashcardIds.has(material.id)}
                                error={flashcardErrors[material.id]}
                                onGenerate={() => generateFlashcards(material.id)}
                                onShowAnswer={() => showAnswer(material.id)}
                                onPrevious={() => {previousCard(material.id)}}
                                onNext={() => {nextCard(material.id)}}
                            />
                        }
                        quizContent=
                        {
                            <QuizMode 
                                questions={quizQuestions}
                                currentIndex={currentQuizIndex}
                                selectedAnswer={selectedQuizAnswer}
                                score={quizScore[material.id]}
                                isGenerating={generatingQuizIds.has(material.id)}
                                error={quizError[material.id]}
                                onGenerate={() => generateQuiz(material.id)}
                                onSelectAnswer={(optionIndex) => {
                                    if (!currentQuizQuestion) return;
                                    selectAnswer(material.id, currentQuizQuestion.id, optionIndex);
                                }}
                                onPrevious={() => previousQuestion(material.id)}
                                onNext={() => nextQuestion(material.id)}
                                onSubmit={() => submitQuiz(material.id)}
                                onRetry={() => retryQuiz(material.id)}
                            />
                        }
                    />  
                );
            })}
        </>
    );
}
export default StudySetPage;


/*
This page represents one specific study set. It reads the study-set ID from the URL using useParams, loads that study set from Supabase, 
and loads its uploaded study materials. It also lets users select and securely upload PDF files to the study-materials Storage bucket, 
creates matching records in the study_materials database table, removes uploaded files if the database insert fails,
and updates the material list immediately after a successful upload.
*/