import { useParams } from "react-router";

function StudySetPage()
{
    const { id } = useParams();
    return (
        <>
            <h1>Study Set Page</h1>
            <h3>Study Set ID: {id}</h3>
        </>
    );
}
export default StudySetPage;