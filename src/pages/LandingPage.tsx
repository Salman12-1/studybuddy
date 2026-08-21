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