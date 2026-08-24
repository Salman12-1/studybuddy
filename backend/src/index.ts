import express from "express";
import cors from "cors";
import supabase from "./lib/supabase";
import { requireAuth } from "./middleware/requireAuth";
import { createUserSupabaseClient } from "./lib/createUserSupabaseClient";
import { PDFParse } from "pdf-parse";

const app = express();

app.use(cors());
app.use(express.json());


//run function when /health is requested
app.get("/health", (_request, response) => {//"_" in request means i know its there but i dont need it rn.

    response.json({ status: "ok" });
});


//run function when server starts
app.listen(3000, () => {

    console.log("StudyBuddy backend running on port 3000");
});


app.post("/api/materials/:id/extract", requireAuth, async (request, response) => {

    const materialId = request.params.id;
    const token = response.locals.accessToken;

    const userSupabase = createUserSupabaseClient(token);

    const {data, error} = await userSupabase
    .from("study_materials")
    .select("id, file_name, storage_path, mime_type, study_set_id")
    .eq("id", materialId)
    .maybeSingle();

    if(error)
    {
        return response.status(500).json({
            error: "Failed to load material"
        });
    }

    if(!data)
    {
        return response.status(404).json({
            error: "Material not found"
        });
    }

    const {data: pdfBlob, error: downloadError} = await userSupabase.storage
    .from("study-materials")
    .download(data.storage_path);


    if (downloadError || !pdfBlob) 
    {
        console.error(downloadError);

        return response.status(500).json({
            error: "Failed to download material"
        });
    }


    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);


    const parser = new PDFParse({
        data: pdfBuffer
    });


    let extractedText = "";
    try 
    {
        const result = await parser.getText();
        extractedText = result.text;
    }
    catch (parseError) 
    {
        console.error(parseError);

        return response.status(500).json({
            error: "Failed to process PDF"
        });
    }
    finally 
    {
        await parser.destroy();
    }


    const{error: updateError} = await userSupabase
    .from("study_materials")
    .update({"extracted_text": extractedText})
    .eq("id", materialId);

    if(updateError)
    {
        return response.status(500).json({
            error: "Failed to save extracted text"
        });
    }
    response.json(data);
});