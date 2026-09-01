import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import "./Auth.css";

function RegisterPage()
{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");


    async function submitForm(event: React.SyntheticEvent<HTMLFormElement>) 
    {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setIsSubmitting(false);
            return;
        }

        setSuccessMessage("Check your email to verify your account.");
        setIsSubmitting(false);
        console.log(data);
    }



    return (
        <div className="auth-page">
            <Link className="auth-brand" to="/">
                StudyBuddy
            </Link>

            <main className="auth-card">

                <div className="auth-heading">
                    <h1>Create your account</h1>
                    <p>Start studying smarter with StudyBuddy.</p>
                </div>


                <form className="auth-form" onSubmit={submitForm}>

                    <div className="auth-field">
                        <label htmlFor="name">Name</label>
                        <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(event) => setName(event.target.value)} 
                        required/>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input 
                        id="email"
                        type="email" 
                        value={email} 
                        onChange={(event) => setEmail(event.target.value)} 
                        required/>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input 
                        id="password"
                        type="password" 
                        value={password} 
                        onChange={(event) => setPassword(event.target.value)} 
                        required/>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                        id="confirmPassword"
                        type="password" 
                        value={confirmPassword} 
                        onChange={(event) => setConfirmPassword(event.target.value)} 
                        required/>
                    </div>


                    {error && <p className="auth-error">{error}</p>}

                    {successMessage && (
                        <p className="auth-success">{successMessage}</p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                    
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </main>
            
            <Link className="auth-back-link" to="/">← Back Home</Link>     
        </div>
    );
}

export default RegisterPage;


/*
This page handles account creation. It collects the user’s name, email, password, and password confirmation, validates matching passwords,
and uses Supabase signUp to create the account. It also stores the user's name as authentication metadata, 
handles Supabase errors, prevents duplicate submissions, and tells the user to verify their email after successful registration.
*/