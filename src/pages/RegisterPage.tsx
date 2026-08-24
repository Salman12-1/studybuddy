import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";

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
        <>
            <h1>Register Page.</h1>
            <Link to="/">Back Home</Link>
            <Link to="/login">Already have an account? Login</Link>

            <form onSubmit={submitForm}>
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} required/>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required/>
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required/>
                {error && <p>{error}</p>}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
                {successMessage && <p>{successMessage}</p>}
            </form>
        </>
    );
}

export default RegisterPage;


/*
This page handles account creation. It collects the user’s name, email, password, and password confirmation, validates matching passwords,
and uses Supabase signUp to create the account. It also stores the user's name as authentication metadata, 
handles Supabase errors, prevents duplicate submissions, and tells the user to verify their email after successful registration.
*/