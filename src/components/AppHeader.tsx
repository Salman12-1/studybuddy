import { supabase } from "../lib/supabase";
import "./AppHeader.css";

function AppHeader()
{
    async function handleLogout()
    {
        const { error } = await supabase.auth.signOut();

        if (error)
        {
            console.error(error.message);
        }
    }

    return (
        <header className="app-header">
            <div className="app-header-content">
                <span className="app-brand">StudyBuddy</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </header>
    );
}

export default AppHeader;