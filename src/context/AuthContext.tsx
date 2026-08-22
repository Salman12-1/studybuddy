import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

type AuthContextType = {
    session: Session | null;
    loading: boolean;
};
type AuthProviderProps = {
    children: ReactNode;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() 
{
    const context = useContext(AuthContext);

    if(context === undefined)
    {
        throw new Error("useAuth must be used inside AuthProvider.")
    }
    return context;
}

function AuthProvider({ children }: AuthProviderProps)
{
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    async function getSession()
    {
        const {data} = await supabase.auth.getSession();

        setSession(data.session);
        setLoading(false);
    }


    useEffect(() => {

        getSession();

        const { data } = supabase.auth.onAuthStateChange(//"Tell me whenever login/logout happens"
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            data.subscription.unsubscribe();
        };
    }, []);


    return (
        <AuthContext.Provider value={{ session, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
export default AuthProvider;