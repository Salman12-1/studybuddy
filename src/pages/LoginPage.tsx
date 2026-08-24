import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

function LoginPage()
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();


    async function submitForm(event: React.SyntheticEvent<HTMLFormElement>)
    {
        event.preventDefault()
        
        setError("");
        setIsSubmitting(true);

        const {error:logInError} = await supabase.auth.signInWithPassword({email, password});

        if(logInError)
        {
            setError(logInError.message);
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(false);
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
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
                {error && <p>{error}</p>}
            </form>
        </>
    );
}

export default LoginPage;


/*
This page handles real user login. It stores the entered email and password in React state, submits them to Supabase using signInWithPassword, 
displays authentication errors when necessary, prevents repeated submissions while logging in, and navigates successful users to the Dashboard.
*/