import { useState } from "react";
import { Link, useNavigate } from "react-router";

function LoginPage()
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    function submitForm(event: React.SyntheticEvent<HTMLFormElement>)
    {
        event.preventDefault()
        console.log(email);
        console.log(password);
        navigate("/dashboard");
    }
    return (
        <>
            <h1>Login Page.</h1>
            <Link to="/">Back Home</Link>
            <Link to="/register">Create account</Link>
            <form onSubmit={submitForm}>

                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button type="submit">Login</button>

            </form>
        </>
    );
}

export default LoginPage;