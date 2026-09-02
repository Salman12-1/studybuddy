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
    const [showPassword, setShowPassword] = useState(false);
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
                        autoComplete="email"
                        type="email" 
                        value={email} 
                        onChange={(event) => setEmail(event.target.value)} 
                        required />
                    </div>


                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        
                        <div className="password-input-wrapper">
                            <input 
                            id="password"
                            autoComplete="current-password"
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(event) => setPassword(event.target.value)} 
                            required />


                            <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((previous) => !previous)}
                            aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                        <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c6 0 9 8 9 8a16 16 0 0 1-2 3.2" />
                                        <path d="M6.6 6.6C4.2 8.2 3 12 3 12s3 8 9 8a9.7 9.7 0 0 0 4.1-.9" />
                                    </svg>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
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