import { useState } from "react";
import { Link, useNavigate } from "react-router";
function RegisterPage()
{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function submitForm(event: React.SyntheticEvent<HTMLFormElement>)
    {
        event.preventDefault();
        if(password === confirmPassword)
        {
            setError("");
            navigate("/dashboard");
        }
        else
        {
            setError("Passwords do not match.");
        }

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
                <button type="submit">Create Account</button>
            </form>
        </>
    );
}

export default RegisterPage;