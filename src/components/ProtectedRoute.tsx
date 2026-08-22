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