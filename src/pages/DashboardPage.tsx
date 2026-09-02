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
    const [isLoadingStudySets, setIsLoadingStudySets] = useState(true);
    const [studySetsError, setStudySetsError] = useState("");
    const [isCreatingStudySet, setIsCreatingStudySet] = useState(false);
    const [createStudySetError, setCreateStudySetError] = useState("");
    const { session } = useAuth();

    
    async function loadStudySets() 
    {
        setIsLoadingStudySets(true);
        setStudySetsError("");

        try
        {
            const {data, error} = await supabase
            .from("study_sets")
            .select("id, title");

            if(error)
            {
                console.error(error.message);
                setStudySetsError("Failed to load your study sets.");
                return;
            }
            setStudySets(data);
        }
        catch(error)
        {   
            console.error(error);
            setStudySetsError("Something went wrong while loading your study sets."); 
        }
        finally
        {
            setIsLoadingStudySets(false);
        }
        
        
    }

    async function createStudySet(event: React.SyntheticEvent<HTMLFormElement>) 
    {
        event.preventDefault();

        if(newTitle.trim() === "")
            return;

        if(!session)
            return;

        setIsCreatingStudySet(true);
        setCreateStudySetError("");


        try
        {
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
                setCreateStudySetError("Failed to create the study set.");
                return;
            }

            setStudySets((previousStudySets) => [
                ...previousStudySets,
                data
            ]);
            
            setNewTitle("");
            setIsCreating(false);
        }
        catch(error)
        {
            console.error(error);
            setCreateStudySetError("Something went wrong while creating the study set.");
        }
        finally
        {
            setIsCreatingStudySet(false);
        }
    }

    useEffect(() => {
        loadStudySets();
    }, []);


    return (
        <div className="dashboard-page">
            <AppHeader />

            <main className="dashboard-container">
                <div className="dashboard-intro">
                    <h1>Dashboard</h1>
                    <p>Pick up where you left off.</p>
                </div>

                <div className="dashboard-section-header">
                    <h2>Your Study Sets</h2>

                    {!isCreating && 
                    <button className="create-study-set-button"
                    onClick={() => {
                        setCreateStudySetError("");
                        setIsCreating(true);
                    }}>
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
                                disabled={isCreatingStudySet}
                                onChange={(event) => setNewTitle(event.target.value)}
                                autoFocus
                            />

                            {createStudySetError && (
                                <p className="create-study-set-error">
                                    {createStudySetError}
                                </p>
                            )}
                        </div>
                        <div className="create-study-set-actions">
                            <button 
                            className="secondary-button" 
                            type="button" 
                            disabled={isCreatingStudySet}
                            onClick={() => setIsCreating(false)}>
                                Cancel
                            </button>

                            <button 
                            className="primary-button" 
                            type="submit"
                            disabled={isCreatingStudySet}>
                                {isCreatingStudySet ? "Creating..." : "Create Study Set"}
                            </button>
                        </div>
                    </form>
                }


                {isLoadingStudySets ? (
                    <div className="dashboard-state">
                        <p>Loading study sets...</p>
                    </div>
                ) : studySetsError ? (
                    <div className="dashboard-state dashboard-state-error">
                        <h3>Couldn't load your study sets</h3>
                        <p>{studySetsError}</p>

                        <button
                        className="secondary-button"
                        onClick={loadStudySets}>
                            Try again
                        </button>
                    </div>
                ) : studySets.length === 0 ? (
                    <div className="dashboard-state">
                        <h3>No study sets yet</h3>
                        <p>Create your first study set to get started.</p>
                    </div>
                ) : (
                    <div className="study-set-grid">
                        {studySets.map((studySet) => (
                            <StudySetCard 
                            key={studySet.id}
                            id={studySet.id}
                            title={studySet.title}
                        />
                        ))}
                    </div>
                )}
                
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