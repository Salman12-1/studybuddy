import { Link } from "react-router";
type StudySetCardProps = 
{
    id: number;
    title: string;
}

function StudySetCard({id, title}: StudySetCardProps)
{
    return(
        <>
            <Link to={`/study/${id}`}>
                <h3>{title}</h3>
            </Link>
        </>
    );
}

export default StudySetCard;