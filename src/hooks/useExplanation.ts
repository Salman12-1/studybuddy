import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { StudyMaterial } from "../types/study";


function useExplanation()
{
    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [explainingIds, setExplainingIds] = useState<Set<string>>(new Set());
    const [explainErrors, setExplainErrors] = useState<Record<string, string>>({});
    const { session } = useAuth();

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


    function loadSavedExplanations(materials: StudyMaterial[])
    {
        const savedExplanations: Record<string, string> = {};

        materials.forEach((material) => {
            if (material.explanation) {
                savedExplanations[material.id] = material.explanation;
            }
        });
        setExplanations(savedExplanations);
    }



    return {
        explanations,
        explainingIds,
        explainErrors,
        explainMaterial,
        loadSavedExplanations,
    };
}

export default useExplanation;