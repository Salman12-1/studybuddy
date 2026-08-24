import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() 
{
    const { session, loading } = useAuth();

    if(loading)
    {
        return(<p>Loading...</p>);
    }
    if(!session)
    {
        return(<Navigate to="/login" replace />);
    }
    return(<Outlet />);
}

export default ProtectedRoute;

/*
This component protects pages that should only be accessible to logged-in users. It reads the current authentication session from AuthContext. 
While authentication is being checked it displays a loading state; if no session exists it redirects the user to /login; 
otherwise it renders the requested protected page using Outlet.
*/