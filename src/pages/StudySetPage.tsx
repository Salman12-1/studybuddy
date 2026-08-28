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
    const { id } = useParams();
    const { session } = useAuth();


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

                return(
                    <div key={material.id}>
                        <h5>{material.file_name}</h5>
                        <button onClick={() => explainMaterial(material.id)} disabled={explainingIds.has(material.id)}>
                            {explainingIds.has(material.id)
                                ? "Generating..."
                                : explanations[material.id]
                                    ? "Regenerate" : "Explain"}
                        </button>
                        
                        <button onClick={() => generateFlashcards(material.id)} disabled={generatingFlashcardIds.has(material.id)}>
                            {generatingFlashcardIds.has(material.id)
                                ? "Generating Flashcards..."
                                : flashcardsByMaterial[material.id]?.length
                                    ? "Regenerate Flashcards" : "Generate Flashcards"}
                        </button>
                            
                        {flashcardErrors[material.id] && (
                            <p>{flashcardErrors[material.id]}</p>
                        )}

                        {currentFlashcard && (
                            <div> 
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
                            </div>
                        )}




                        {explainErrors[material.id] && (
                            <p>{explainErrors[material.id]}</p>
                        )}

                        {explanations[material.id] && (
                            <div>
                                <h4>Explanation</h4>
                                <ReactMarkdown>{explanations[material.id]}</ReactMarkdown>
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