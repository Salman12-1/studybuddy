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
    const [showPassword, setShowPassword] = useState(false);

    const hasMinimumLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const isPasswordStrong =
    hasMinimumLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber;


    async function submitForm(event: React.SyntheticEvent<HTMLFormElement>) 
    {
        event.preventDefault();
        

        if (!isPasswordStrong)
        {
            setError("Password does not meet the requirements.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        const { error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                },
                emailRedirectTo: `${window.location.origin}/login`
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setIsSubmitting(false);
            return;
        }

        setSuccessMessage("Check your email to verify your account.");
        setIsSubmitting(false);
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
                        autoComplete="name"
                        type="text" 
                        value={name} 
                        onChange={(event) => setName(event.target.value)} 
                        required/>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input 
                        id="email"
                        autoComplete="email"
                        type="email" 
                        value={email} 
                        onChange={(event) => setEmail(event.target.value)} 
                        required/>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>

                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                autoComplete="new-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />

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


                    <div className="auth-field">
                        <label htmlFor="confirmPassword">Confirm Password</label>

                        <div className="password-input-wrapper">
                            <input 
                            id="confirmPassword"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword} 
                            onChange={(event) => setConfirmPassword(event.target.value)} 
                            required/>

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

                    
                    <div className="password-requirements">
                        <p>Password must contain:</p>

                        <span className={hasMinimumLength ? "requirement-met" : ""}>
                            ✓ At least 8 characters
                        </span>

                        <span className={hasUppercase ? "requirement-met" : ""}>
                            ✓ One uppercase letter
                        </span>

                        <span className={hasLowercase ? "requirement-met" : ""}>
                            ✓ One lowercase letter
                        </span>

                        <span className={hasNumber ? "requirement-met" : ""}>
                            ✓ One number
                        </span>
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