import { Link } from "react-router";
type StudySetCardProps = 
{
    id: string;
    title: string;
}

function StudySetCard({id, title}: StudySetCardProps)
{
    return(
        <Link to={`/study/${id}`} className="study-set-card">
            <h3>{title}</h3>
            <span className="study-set-card-action"> Open study set → </span>
        </Link>
    );
}

export default StudySetCard;


/*
This reusable component represents one study set on the Dashboard. It receives the study set’s ID and title as props and displays the title as a link. 
Clicking the card navigates the user to /study/:id, allowing each study set to have its own page.
*/