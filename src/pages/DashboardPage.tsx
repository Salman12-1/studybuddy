import { useState, useEffect } from "react";
import StudySetCard from "../components/StudySetCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";
import AppHeader from "../components/AppHeader";

type StudySet =
{
    id: string;
    title: string;
}

function DashboardPage()
{
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const { session } = useAuth();

    
    async function loadStudySets() 
    {
        const {data, error} = await supabase
        .from("study_sets")
        .select("id, title");

        if(error)
        {
            console.error(error.message);
            return;
        }
        
        setStudySets(data);
    }


    

    async function createStudySet(event: React.SyntheticEvent<HTMLFormElement>) 
    {
        event.preventDefault();

        if(newTitle.trim() === "")
            return;

        if(!session)
            return;

        const {data, error} = await supabase
        .from("study_sets")
        .insert({
            title: newTitle.trim(),
            user_id: session.user.id,//logged in user's UUID. 
        })
        .select("id, title")//return created row.
        .single();//return one object instead of an array.

        if (error) 
        {
            console.error(error.message);
            return;
        }

        setStudySets((previousStudySets) => [
            ...previousStudySets,
            data
        ]);
        
        setNewTitle("");
        setIsCreating(false);
    }

    useEffect(() => {
        loadStudySets();
    }, []);


    return (
        <div className="dashboard-page">
            <AppHeader/ >

            <main className="dashboard-container">
                <div className="dashboard-intro">
                    <h1>Dashboard</h1>
                    <p>Pick up where you left off.</p>
                </div>

                <div className="dashboard-section-header">
                    <h2>Your Study Sets</h2>

                    {!isCreating && 
                    <button className="create-study-set-button"
                    onClick={() => setIsCreating(true)}>
                        + Create Study Set
                    </button>}
                </div>


                {isCreating && 
                    <form onSubmit={createStudySet} className="create-study-set-form">
                        <div className="create-study-set-field">
                            <label htmlFor="study-set-title">Study set name</label>
                            <input
                                id="study-set-title"
                                type="text"
                                placeholder="e.g. Operating Systems"
                                value={newTitle}
                                onChange={(event) => setNewTitle(event.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="create-study-set-actions">
                            <button className="secondary-button" type="button" onClick={() => setIsCreating(false)}>
                                Cancel
                            </button>

                            <button className="primary-button" type="submit">
                                Create Study Set
                            </button>
                        </div>
                    </form>
                }

                {studySets.length === 0 && (
                    <p className="dashboard-empty">
                        No study sets yet. Create one to get started.
                    </p>
                )}

                <div className="study-set-grid">
                    {studySets.map((studySet) => (
                        <StudySetCard 
                            key={studySet.id}
                            id= {studySet.id}
                            title= {studySet.title}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;

/*
This is the main page users see after logging in. It loads the authenticated user’s study sets from the study_sets database table, 
displays them using StudySetCard, allows the user to create new study sets, and logs the user out through Supabase. 
Study sets are now stored permanently in the database rather than only in React state.
*/