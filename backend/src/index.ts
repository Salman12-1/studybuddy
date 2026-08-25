import express from "express";
import cors from "cors";
import supabase from "./lib/supabase";
import { requireAuth } from "./middleware/requireAuth";
import { createUserSupabaseClient } from "./lib/createUserSupabaseClient";
import { PDFParse } from "pdf-parse";
import openai from "./lib/openai";

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



app.post("/api/materials/:id/explain", requireAuth, async (request, response) => {
        
    const materialId = request.params.id;
    const token = response.locals.accessToken;

    const userSupabase = createUserSupabaseClient(token);

    const{ data, error } = await userSupabase
    .from("study_materials")
    .select("id, file_name, extracted_text")
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

    if (!data.extracted_text) 
    {
        return response.status(400).json({
            error: "Material has not been extracted yet"
        });
    }

    // Temporary token-limit strategy.
    // Later, when we implement chunking for large PDFs, revisit this logic.
    const textLength = data.extracted_text.length;

    let maxOutputTokens = 1200;

    if (textLength > 12000)
    {
        maxOutputTokens = 2000;
    }

    if (textLength > 25000)
    {
        maxOutputTokens = 3000;
    }

    try
    {
        const aiResponse = await openai.responses.create({
            model: "gpt-5.6-luna",
            input: `
                You are a study assistant.

                Explain the following material in a concise, easy-to-understand way for a university student.

                Rules:
                - Do not rewrite or repeat the document.
                - Focus on the most important concepts.
                - Explain difficult ideas in simpler words.
                - Use short sections or bullet points where helpful.
                - Stay faithful to the source material.
                - If the source includes examples, explain or simplify those examples.
                - If the source does not include an example, do not invent one.
                - Do not change or invent facts, numbers, definitions, or terminology.
                - Keep the explanation reasonably short.
                - Do not add conclusions, implications, or advice that are not explicitly supported by the source material.
                - If something is not stated in the source, omit it.

                Study material:
                ${data.extracted_text}
            `,
            max_output_tokens: maxOutputTokens,
        });

        return response.json({
            explanation: aiResponse.output_text
        });
    }

    catch (aiError)
    {
        console.error(aiError);

        return response.status(500).json({
            error: "Failed to generate explanation"
        });
    }
    
});