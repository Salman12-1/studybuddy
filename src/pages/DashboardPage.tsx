import { useState } from "react";
import StudySetCard from "../components/StudySetCard";
type StudySet =
{
    id: number;
    title: string;
}

function DashboardPage()
{
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    function createStudySet(event: React.SyntheticEvent<HTMLFormElement>) 
    {
        event.preventDefault();

        if(newTitle.trim() === "")
            return;

        setStudySets([...studySets, {id: Date.now(), title: newTitle}]);
        setNewTitle("");
        setIsCreating(false);
    }


    return (
        <>
            <h1>StudyBuddy Dashboard</h1>
            <h2>Your Study Sets</h2>
            {!isCreating && <button onClick={() => setIsCreating(true)}>+ Create Study Set</button>}
            {isCreating && 
                <form onSubmit={createStudySet}>
                    <input type="text" value={newTitle} onChange={(event) => setNewTitle(event.target.value)}/>
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                </form>
            }
            {studySets.length === 0 && <p>No study sets yet.</p>}

            {studySets.map((studySet) => (
                <StudySetCard 
                    key={studySet.id}
                    id= {studySet.id}
                    title= {studySet.title}
                />
            ))}
        </>
    );
}

export default DashboardPage;