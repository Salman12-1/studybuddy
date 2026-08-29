import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";

type StudySet = 
{
    id: string;
    title: string;
};

type StudyMaterial=
{
    id: string;
    file_name: string;
    storage_path: string;
    mime_type: string;
    explanation: string | null;
};
type Flashcard = 
{
    id: string;
    study_material_id: string;
    question: string;
    answer: string;
    position: number;
};
type QuizQuestion = 
{
    id: string;
    study_material_id: string;
    question: string;
    options: string[];
    correct_option: number;
    position: number;
};


function StudySetPage()
{
    const [studySet, setStudySet] = useState<StudySet | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);

    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [explainingIds, setExplainingIds] = useState<Set<string>>(new Set());
    const [explainErrors, setExplainErrors] = useState<Record<string, string>>({});

    const [flashcardsByMaterial, setFlashcardsByMaterial] = useState<Record<string, Flashcard[]>>({});
    const [generatingFlashcardIds, setGeneratingFlashcardIds] = useState<Set<string>>(new Set());
    const [flashcardErrors, setFlashcardErrors] = useState<Record<string, string>>({});
    const [flashcardIndexes, setFlashcardIndexes] = useState<Record<string, number>>({});
    const [shownAnswerIds, setShownAnswerIds] = useState<Set<string>>(new Set());

    const [quizQuestionsByMaterial, setQuizQuestionsByMaterial] = useState<Record<string, QuizQuestion[]>>({});
    const [generatingQuizIds, setGeneratingQuizIds] = useState<Set<string>>(new Set());
    const [quizIndexes, setQuizIndexes] = useState<Record<string, number>>({});
    const [quizAnswersByMaterial, setQuizAnswersByMaterial] = useState<Record<string, Record<string, number>>>({});
    const [quizScore, setQuizScore] = useState<Record<string, number>>({});
    const [quizError, setQuizErrors] = useState<Record<string, string>>({});

    const [studyMode, setStudyMode] = useState<Record<string, "explain" | "flashcards" | "quiz">>({});

    const { id } = useParams();
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


    async function loadFlashcards(materialIds: string[])
    {   
        if(materialIds.length === 0)
        {
            setFlashcardsByMaterial({});
            return;
        }

        const {data, error} = await supabase
        .from("flashcards")
        .select("id, study_material_id, question, answer, position")
        .in("study_material_id", materialIds)
        .order("position", { ascending: true });
        
        if(error)
        {
            console.error(error);
            return;
        }


        const groupedFlashcards: Record<string, Flashcard[]> = {};

        data.forEach((flashcard) => {
            if (!groupedFlashcards[flashcard.study_material_id])
            {
                groupedFlashcards[flashcard.study_material_id] = [];
            }
            groupedFlashcards[flashcard.study_material_id].push(flashcard);
        });

        setFlashcardsByMaterial(groupedFlashcards);
    }


    
    async function generateFlashcards(materialId: string)
    {
        if(!session)
        {
            console.error("No session");
            return;
        }
        
        setFlashcardErrors((prev) => {
            const next = { ...prev };
            delete next[materialId];
            return next;
        });


        setGeneratingFlashcardIds((prev) => {
            const next = new Set(prev);
            next.add(materialId);
            return next;
        });

        setFlashcardIndexes((prev) => ({
            ...prev,
            [materialId]: 0,
        }));


        try
        {
            const url = `http://localhost:3000/api/materials/${materialId}/flashcards`;

            const response = await fetch(url ,{
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            const data = await response.json();

            if (!response.ok)
            {
                console.error(data.error);
                
                setFlashcardErrors((prev) => ({
                    ...prev,
                    [materialId]: data.error,
                }));

                return;
            }


            setFlashcardsByMaterial((prev) => ({
                ...prev,
                [materialId]: data.flashcards,
            }));

            setShownAnswerIds((prev) => {
                const next = new Set(prev);
                next.delete(materialId);
                return next;
            });
        }
        catch (error)
        {
            console.error(error);

            setFlashcardErrors((prev) => ({
                ...prev,
                [materialId]: "Could not connect to the server",
            }));
        }
        finally
        {
            setGeneratingFlashcardIds((prev) => {
                const next = new Set(prev);
                next.delete(materialId);
                return next;
            });
        }

    }


    async function explainMaterial(materialId: string) 
    {
        if(!session)
        {
            console.error("No session");
            return;
        }

        setExplainErrors((prev) => {
            const next = { ...prev };
            delete next[materialId];
            return next;
        });


        setExplainingIds((prev) => {
            const next = new Set(prev);
            next.add(materialId);
            return next;
        });

        try 
        {
            const url = `http://localhost:3000/api/materials/${materialId}/explain`;

            const response = await fetch(url ,{
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

           const data = await response.json();

            if (!response.ok)
            {
                console.error(data.error);
                
                setExplainErrors((prev) => ({
                    ...prev,
                    [materialId]: data.error,
                }));

                return;
            }

            setExplanations((prev) => ({
                ...prev, 
                [materialId]: data.explanation,
            }));
        }
        catch (error)
        {
            console.error(error);

            setExplainErrors((prev) => ({
                ...prev,
                [materialId]: "Could not connect to the server",
            }));
        }
        finally 
        {
            setExplainingIds((prev) => {
                const next = new Set(prev);
                next.delete(materialId);
                return next;
            });
        }
    }


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

        const savedExplanations: Record<string, string> = {};

        data.forEach((material) => {
            if (material.explanation) {
                savedExplanations[material.id] = material.explanation;
            }
        });

        const materialIds = data.map((material) => material.id);
        await loadFlashcards(materialIds)
        await loadQuizQuestions(materialIds)

        setExplanations(savedExplanations);
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
                const currentFlashcard = cards?.[currentIndex];
                
                const quizQuestions = quizQuestionsByMaterial[material.id];
                const currentQuizIndex = quizIndexes[material.id] ?? 0;
                const currentQuizQuestion = quizQuestions?.[currentQuizIndex];  
                const selectedQuizAnswer = currentQuizQuestion ? quizAnswersByMaterial[material.id]?.[currentQuizQuestion.id] : undefined;
                let score = 0;

                return(
                    <div key={material.id}>
                        <h5>{material.file_name}</h5>
                        <button  
                        onClick={() => {
                            setStudyMode((prev) => ({
                                ...prev,
                                [material.id]: "explain",
                            }));
                        }}>
                            Explanation
                        </button>
                        

                        <button 
                        onClick={() => {
                            setStudyMode((prev) => ({
                                ...prev,
                                [material.id]: "flashcards",
                            }));
                        }}>

                            Flashcards
                        </button>
                        

                        <button 
                        onClick={() => {
                            setStudyMode((prev) => ({
                                ...prev,
                                [material.id]: "quiz",
                            }));
                        }}>

                            Quiz
                        </button>


                        {explainErrors[material.id] && (
                            <p>{explainErrors[material.id]}</p>
                        )}

                        {studyMode[material.id] === "explain" && (
                            <div>
                                {explanations[material.id] ? (
                                <>
                                    <h4>Explanation</h4>
                                    <ReactMarkdown>{explanations[material.id]}</ReactMarkdown>
                                    <button 
                                    disabled={explainingIds.has(material.id)}
                                    onClick={() => explainMaterial(material.id)}>
                                        {explainingIds.has(material.id)
                                            ? "Generating..."
                                            :"Regenerate Explanation"
                                        } 
                                    </button>
                                </>
                                ) :
                                (
                                    <>
                                        <h4>No explanation generated yet.</h4>
                                        <button 
                                        disabled={explainingIds.has(material.id)}
                                        onClick={() => explainMaterial(material.id)}>
                                            {explainingIds.has(material.id)
                                                ? "Generating..."
                                                :"Generate Explanation"
                                            } 
                                        </button>
                                    </>
                                )}
                                
                            </div>
                        )}


                        {flashcardErrors[material.id] && (
                            <p>{flashcardErrors[material.id]}</p>
                        )}

                        {studyMode[material.id] === "flashcards"  && (
                            <div> 
                                {currentFlashcard ? (
                                    <>
                                        <h4>Flashcards</h4>
                                        <p>Card {currentIndex + 1} of {cards.length}</p>
                                        <p><strong>Question: </strong> {currentFlashcard.question}</p>
                                        
                                        {shownAnswerIds.has(material.id) ? (
                                            <p><strong>Answer:</strong> {currentFlashcard.answer}</p>
                                        ) : (
                                            <button onClick={() => {
                                                setShownAnswerIds((prev) => {
                                                    const next = new Set(prev);
                                                    next.add(material.id);
                                                    return next;
                                                });
                                            }}>

                                                Show Answer
                                            
                                            </button>
                                        )}


                                        <button 
                                            disabled = {currentIndex === 0} 
                                            onClick={() => {
                                                setFlashcardIndexes((prev) => ({
                                                    ...prev,
                                                    [material.id]: currentIndex - 1,
                                                }));

                                                setShownAnswerIds((prev) => {
                                                    const next = new Set(prev);
                                                    next.delete(material.id);
                                                    return next;
                                                });
                                            }}
                                        >
                                            Previous
                                        </button>



                                        <button
                                            disabled={currentIndex === cards.length - 1}
                                            onClick={() => {
                                                setFlashcardIndexes((prev) => ({
                                                    ...prev,
                                                    [material.id]: currentIndex + 1,
                                                }));

                                                setShownAnswerIds((prev) => {
                                                    const next = new Set(prev);
                                                    next.delete(material.id);
                                                    return next;
                                                });
                                            }}
                                        >
                                            Next
                                        </button>

                                        <button
                                        disabled={generatingFlashcardIds.has(material.id)}
                                        onClick={() => generateFlashcards(material.id)}
                                        >
                                            {generatingFlashcardIds.has(material.id)
                                                ? "Generating..."
                                                :"Regenerate flashcards"
                                            } 
                                        </button>
                                    </>
                                ) 
                                :(
                                    <>
                                        <h4>No flashcards generated yet.</h4>
                                        <button 
                                        disabled={generatingFlashcardIds.has(material.id)}
                                        onClick={() => generateFlashcards(material.id)}
                                        >
                                            {generatingFlashcardIds.has(material.id)
                                                ? "Generating..."
                                                :"Generate Flashcards"
                                            } 
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {quizError[material.id] && 
                            <p>{quizError[material.id]}</p>
                        }

                        {studyMode[material.id] === "quiz" && (
                            <div>
                                {currentQuizQuestion ? 
                                (
                                    <>
                                        <h4>Quiz</h4>

                                        <p>
                                            Question {currentQuizIndex + 1} of {quizQuestions.length}
                                        </p>

                                        <p>
                                            <strong>{currentQuizQuestion.question}</strong>
                                        </p>

                                        {currentQuizQuestion.options.map((option, optionIndex) => (
                                            <div key={optionIndex}>
                                                <label>
                                                    <input type="radio" name={currentQuizQuestion.id} checked={selectedQuizAnswer === optionIndex} 
                                                    disabled={quizScore[material.id] !== undefined}
                                                    onChange={() => {
                                                        setQuizAnswersByMaterial((prev) => ({
                                                                ...prev,
                                                                [material.id]   : 
                                                                {
                                                                    ...prev[material.id],
                                                                    [currentQuizQuestion.id]: optionIndex,
                                                                },
                                                            }));  
                                                        }}
                                                    />
                                                    {option} 
                                                </label>
                                                
                                            </div>
                                        ))}


                                        {quizScore[material.id] !== undefined &&
                                            <p>{selectedQuizAnswer === currentQuizQuestion.correct_option ? "Correct" : "Incorrect"}</p>
                                        }

                                        {quizScore[material.id] !== undefined && selectedQuizAnswer !== currentQuizQuestion.correct_option &&
                                            <p>Correct Answer: {currentQuizQuestion.options[currentQuizQuestion.correct_option]}</p>
                                        }


                                        <button 
                                            disabled={currentQuizIndex === 0} 
                                            onClick={() => {
                                                setQuizIndexes((prev) => ({
                                                    ...prev,
                                                    [material.id]: currentQuizIndex - 1,
                                                }));
                                            }}>
                                                Previous
                                            </button>

                                            <button
                                            hidden={currentQuizIndex === quizQuestions.length - 1}
                                            onClick={ () => {
                                                setQuizIndexes((prev) => ({
                                                    ...prev,
                                                    [material.id]: currentQuizIndex + 1,
                                                }))
                                            }}>
                                                Next
                                            </button>

                                            <button
                                            hidden={currentQuizIndex !== quizQuestions.length - 1}
                                            onClick={() => {
                                                quizQuestions.forEach((question) => {
                                                    if (question.correct_option === quizAnswersByMaterial[material.id]?.[question.id])
                                                    {
                                                        score += 1;
                                                    }
                                                })
                                                setQuizScore((prev) => ({
                                                    ...prev,
                                                    [material.id]: score,
                                                }));
                                            }}>
                                                Submit
                                            </button>


                                            <button
                                            hidden={quizScore[material.id] === undefined}
                                            onClick={() => {
                                                setQuizScore((prev) => {
                                                    const next = { ...prev };
                                                    delete next[material.id];
                                                    return next;
                                                });

                                                setQuizAnswersByMaterial((prev) => ({
                                                    ...prev,
                                                    [material.id]: {},
                                                }));

                                                setQuizIndexes((prev) => ({
                                                    ...prev,
                                                    [material.id]: 0,
                                                }));
                                            }}>
                                                Retry Quiz
                                            </button>


                                            {quizScore[material.id] !== undefined && (
                                                <p>Your Score: {quizScore[material.id]} / {quizQuestions.length}</p>
                                            )}

                                            <button 
                                            disabled={generatingQuizIds.has(material.id)}
                                            onClick={() => generateQuiz(material.id)}>
                                                {generatingQuizIds.has(material.id)
                                                    ? "Generating..."
                                                    :"Regenerate Quiz"
                                                } 
                                            </button>
                                    </>
                                ) 
                                :(
                                    <>
                                        <h4>No quiz generated yet.</h4>
                                        <button 
                                        disabled={generatingQuizIds.has(material.id)}
                                        onClick={() => generateQuiz(material.id)}>
                                            {generatingQuizIds.has(material.id)
                                                ? "Generating..."
                                                :"Generate Quiz"
                                            } 
                                        </button>
                                    </>
                                )}
                                
                            </div>
                        )}
                        

                    </div>
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