import { Link } from "react-router";
function LandingPage()
{
    return (
        <>
            <h1>Landing Page.</h1>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </>
    );
}

export default LandingPage;

/*
This is StudyBuddy’s public starting page. At the moment it provides navigation to Login and Register. 
Later it will become the proper landing page that introduces StudyBuddy and explains its main features to users.
*/