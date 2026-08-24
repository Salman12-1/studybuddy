import type { Request, Response, NextFunction } from "express";
import supabase from "../lib/supabase";

export async function requireAuth(
    request: Request,
    response: Response,
    next: NextFunction
) 
{
    //next(): “This request passed my check. Continue to the next function.”

    const authHeader = request.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer "))
    {
        response.status(401).json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.slice(7);

    const { data, error } = await supabase.auth.getUser(token);

    if(error || !data.user)
    {
        response.status(401).json({ error: "Unauthorized" });
        return;
    }

    // think of response.locals = backpack
    response.locals.user = data.user;
    response.locals.accessToken = token;
    next();
}