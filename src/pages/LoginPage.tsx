import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import "./Auth.css";

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
        <div className="auth-page">

            <Link className="auth-brand" to="/">
                StudyBuddy
            </Link>
            
            <main className="auth-card">
                <div className="auth-heading">
                    <h1>Welcome back</h1>
                    <p>Sign in to continue to StudyBuddy.</p>
                </div>


                <form  className="auth-form" onSubmit={submitForm}>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>

                        <input 
                        id="email"
                        type="email" 
                        value={email} 
                        onChange={(event) => setEmail(event.target.value)} 
                        required />
                    </div>


                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                            
                        <input 
                        id="password"
                        type="password" 
                        value={password} 
                        onChange={(event) => setPassword(event.target.value)} 
                        required />
                    </div>


                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                    
                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/register">Create account</Link>
                </p>
            </main>
            <Link className="auth-back-link" to="/">← Back Home</Link>
            
            
        </div>
    );
}

export default LoginPage;


/*
This page handles real user login. It stores the entered email and password in React state, submits them to Supabase using signInWithPassword, 
displays authentication errors when necessary, prevents repeated submissions while logging in, and navigates successful users to the Dashboard.
*/