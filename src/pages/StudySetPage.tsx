import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
};


function StudySetPage()
{
    const [studySet, setStudySet] = useState<StudySet | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [materials, setMaterials] = useState<StudyMaterial[]>([])
    const { id } = useParams();


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

        const {error: errorTable} = await supabase
        .from("study_materials")
        .insert({
            study_set_id: id,
            file_name: selectedFile.name,
            storage_path: path,
            mime_type: selectedFile.type, 
        });

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
        console.log("Table Upload successful");
        await loadMaterials();
        setSelectedFile(null);
    }

    async function loadMaterials()
    {
        const{data, error} = await supabase
        .from("study_materials")
        .select("id, file_name, storage_path, mime_type")
        .eq("study_set_id", id);

        if(error)
        {
            console.error(error);
            return;
        }

        setMaterials(data);
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
            {materials.map((material) => (
                <h5 key={material.id}>{material.file_name}</h5>
            ))}
        </>
    );
}
export default StudySetPage;