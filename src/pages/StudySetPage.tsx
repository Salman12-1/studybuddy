import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type StudySet = 
{
    id: string;
    title: string;
};

function StudySetPage()
{
    const [studySet, setStudySet] = useState<StudySet | null>(null);
    const [loading, setLoading] = useState(true);
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


    useEffect(() => {
        loadStudySet();
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
            <h3>Study Set ID: {id}</h3>
        </>
    );
}
export default StudySetPage;