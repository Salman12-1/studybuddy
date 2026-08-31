import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Flashcard } from "../types/study";

function useFlashcards()
{
    const [flashcardsByMaterial, setFlashcardsByMaterial] = useState<Record<string, Flashcard[]>>({});
    const [generatingFlashcardIds, setGeneratingFlashcardIds] = useState<Set<string>>(new Set());
    const [flashcardErrors, setFlashcardErrors] = useState<Record<string, string>>({});
    const [flashcardIndexes, setFlashcardIndexes] = useState<Record<string, number>>({});
    const [shownAnswerIds, setShownAnswerIds] = useState<Set<string>>(new Set());    
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
            
            setFlashcardIndexes((prev) => ({
                ...prev,
                [materialId]: 0,
            }));
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

    function toggleAnswer(materialId: string)
    {
        setShownAnswerIds((prev) => {
            const next = new Set(prev);
            if(next.has(materialId))
                next.delete(materialId);

            else
                next.add(materialId);
            
            return next;
        });
    }

    function previousCard(materialId: string)
    {
        setShownAnswerIds((prev) => {
            const next = new Set(prev);
            next.delete(materialId);
            return next;
        });        

        setFlashcardIndexes((prev) => ({
            ...prev,
            [materialId]: (prev[materialId] ?? 0) - 1,
        }));
    }

    function nextCard(materialId: string)
    {
        setShownAnswerIds((prev) => {
            const next = new Set(prev);
            next.delete(materialId);
            return next;
        });

        setFlashcardIndexes((prev) => ({
            ...prev,
            [materialId]: (prev[materialId] ?? 0) + 1,
        }));
    }

    return {
        flashcardsByMaterial,
        generatingFlashcardIds,
        flashcardErrors,
        flashcardIndexes,
        shownAnswerIds,
        loadFlashcards,
        generateFlashcards,
        previousCard,
        nextCard,
        toggleAnswer,
    };
}

export default useFlashcards;