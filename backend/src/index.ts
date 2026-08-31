import express from "express";
import cors from "cors";
import supabase from "./lib/supabase";
import { requireAuth } from "./middleware/requireAuth";
import { createUserSupabaseClient } from "./lib/createUserSupabaseClient";
import { PDFParse } from "pdf-parse";
import openai from "./lib/openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { de } from "zod/v4/locales";

const FlashcardsResponse = z.object({
    flashcards: z.array(
        z.object({
            question: z.string(),
            answer: z.string(),
        })
    ),
});

const QuizResponse = z.object({
    questions: z.array(
        z.object({
            question: z.string(),
            options: z.array(z.string()).length(4),
            correct_option: z.number().int().min(0).max(3),
        })
    ),
});

const app = express();

app.use(cors());
app.use(express.json());


//run function when /health is requested
app.get("/health", (_request, response) => {//"_" in request means i know its there but i dont need it rn.

    response.json({ status: "ok" });
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
    .select("id, file_name, extracted_text, explanation")
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



    const regenerationInstructions =
    data.explanation
        ? `
            A previous explanation of this material already exists.

            Previous explanation:
            ${data.explanation}

            Create a NEW explanation of the same source material.

            - Use meaningfully different wording and structure.
            - Explain the same important concepts accurately.
            - Where helpful, use a different teaching approach or simpler phrasing.
            - Do not merely paraphrase the previous explanation sentence by sentence.
            - Do not omit important concepts only for the sake of being different.
        `
        : "";



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
                - Use Markdown formatting.
                - For mathematical expressions, use $...$ for inline math and $$...$$ for displayed equations. Do not use \[...\] or raw LaTeX without math delimiters.
                
                ${regenerationInstructions}
                Study material:
                ${data.extracted_text}
            `,
            max_output_tokens: maxOutputTokens,
        });


        const {error: updateExplanationError} = await userSupabase
        .from("study_materials")
        .update({"explanation": aiResponse.output_text})
        .eq("id", materialId);

        if(updateExplanationError)
        {
            return response.status(500).json({
                error: "Failed to save explanation"
            });
        }


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




app.post("/api/materials/:id/flashcards", requireAuth, async (request, response) => {
        
    const materialId = request.params.id;
    const token = response.locals.accessToken;

    const userSupabase = createUserSupabaseClient(token);

    const {data, error} = await userSupabase
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
    


    const { data: oldFlashcards, error: oldFlashcardsError } =
    await userSupabase
        .from("flashcards")
        .select("question, answer")
        .eq("study_material_id", materialId);

    if (oldFlashcardsError)
    {
        return response.status(500).json({
            error: "Failed to load previous flashcards"
        });
    }

    const previousFlashcards = oldFlashcards
    .map(
        (flashcard, index) =>
            `${index + 1}. Question: ${flashcard.question}\nAnswer: ${flashcard.answer}`
    )
    .join("\n\n");

    const regenerationInstructions =
    oldFlashcards.length > 0
        ? `
            This material already has flashcards.

            Previous flashcards:
            ${previousFlashcards}

            Generate a NEW set of flashcards.
            Do not repeat or closely paraphrase the previous questions.
            Prefer different important concepts from the study material where possible.
            If an important concept must be reused, test it from a meaningfully different angle.
        `
        : "";


    const textLength = data.extracted_text.length;

    let flashcardCount = 10;

    if (textLength > 12000)
    {
        flashcardCount = 15;
    }

    if (textLength > 25000)
    {
        flashcardCount = 20;
    }

    let parsedFlashcards;
    try
    {
        const aiResponse = await openai.responses.parse({
            model: "gpt-5.6-luna",

            input: `
                You are a study assistant.

                Generate exactly ${flashcardCount} flashcards from the study material below.

                Rules:
                - Focus on the most important concepts.
                - Each flashcard must test one clear idea.
                - Keep questions concise and specific.
                - Keep answers concise but complete.
                - Stay faithful to the source material.
                - Do not invent facts, examples, numbers, definitions, or terminology.
                - If something is not stated in the source, do not include it.
                - Avoid duplicate or nearly identical flashcards.

                ${regenerationInstructions}
                Study material:
                ${data.extracted_text}
            `,

            text: {
                format: zodTextFormat(
                    FlashcardsResponse,
                    "flashcards_response"
                ),
            },
        });

        parsedFlashcards = aiResponse.output_parsed;
    }
    catch (aiError)
    {
        console.error(aiError);

        return response.status(500).json({
            error: "Failed to generate flashcards"
        });
    }

    
    if (!parsedFlashcards)
    {
        return response.status(500).json({
            error: "Failed to generate flashcards"
        });
    }

    const flashcardsRows = parsedFlashcards.flashcards.map((flashcard, index) => ({
        "study_material_id": materialId,
        "question": flashcard.question,
        "answer": flashcard.answer,
        "position": index + 1,
    }));


    const { error: deleteError } = await userSupabase
    .from("flashcards")
    .delete()
    .eq("study_material_id", materialId);

    if (deleteError)
    {
        return response.status(500).json({
            error: "Failed to replace old flashcards"
        });
    }



    const {data: savedFlashcards, error: insertError} = await userSupabase
    .from("flashcards")
    .insert(flashcardsRows)
    .select();

    if(insertError)
    {
        return response.status(500).json({
            error: "Failed to save flashcards"
        });
    }

    return response.json({
        flashcards: savedFlashcards
    })
});



app.post("/api/materials/:id/quiz", requireAuth, async (request, response) => {

    const materialId = request.params.id;
    const token = response.locals.accessToken;

    const userSupabase = createUserSupabaseClient(token);

    const {data, error} = await userSupabase
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
    if(!data.extracted_text)
    {
        return response.status(400).json({
            error: "Material has not been extracted yet"
        });
    }




    const { data: oldQuestions, error: oldQuestionsError } =
    await userSupabase
        .from("quiz_questions")
        .select("question")
        .eq("study_material_id", materialId);

    if (oldQuestionsError)
    {
        return response.status(500).json({
            error: "Failed to load previous quiz"
        });
    }


    const previousQuestions = oldQuestions
    .map((item, index) => `${index + 1}. ${item.question}`)
    .join("\n");


    const regenerationInstructions =
    oldQuestions.length > 0
    ? `
        This material already has a quiz.

        Previous quiz questions:
        ${previousQuestions}

        Generate a NEW set of quiz questions.
        Do not repeat or closely paraphrase the previous questions.
        Prefer different concepts from the study material where possible.
        If an important concept must be reused, test it from a meaningfully different angle.
    `
    : "";



    const textLength = data.extracted_text.length;

    let quizQuestionCount = 5;

    if (textLength > 12000)
    {
        quizQuestionCount = 10;
    }

    if (textLength > 25000)
    {
        quizQuestionCount = 15;
    }

    let parsedQuiz;

    try
    {
        const aiResponse = await openai.responses.parse({
             model: "gpt-5.6-luna",

            input: `
                You are a study assistant.

                Generate exactly ${quizQuestionCount} multiple-choice quiz questions
                from the study material below.

                Each question must have exactly 4 answer options.

                Rules:
                - Focus on the most important concepts.
                - Each question should test one clear idea.
                - Include only one correct answer per question.
                - Keep questions and options concise and clear.
                - Stay faithful to the source material.
                - Do not invent facts, examples, numbers, definitions, or terminology.
                - If something is not stated in the source, do not include it.
                - Avoid duplicate or nearly identical questions.

                ${regenerationInstructions}
                Study material:
                ${data.extracted_text}
            `,

            text: {
                format: zodTextFormat(
                    QuizResponse,
                    "quiz_response"
                ),
            },
        });
        parsedQuiz = aiResponse.output_parsed;
    }

    catch(aiError)
    {
        console.error(aiError);

        return response.status(500).json({
            error: "Failed to generate quiz"
        });
    }


    if (!parsedQuiz)
    {
        return response.status(500).json({
            error: "Failed to generate quiz"
        });
    }

    const quizRows = parsedQuiz.questions.map((quiz, index) => ({
        "study_material_id": materialId,
        "question": quiz.question,
        "options": quiz.options,
        "correct_option": quiz.correct_option,
        "position": index + 1 
    }));


    const {error: deleteError} = await userSupabase
    .from("quiz_questions")
    .delete()
    .eq("study_material_id", materialId);

    if(deleteError)
    {
        return response.status(500).json({
            error: "Failed to replace old quiz"
        });
    }


    const {data: savedQuestions, error: insertError} = await userSupabase
    .from("quiz_questions")
    .insert(quizRows)
    .select();

    if(insertError)
    {
        return response.status(500).json({
            error: "Failed to save quiz"
        });
    }

    return response.json({
        questions: savedQuestions
    });
});



//run function when server starts
app.listen(3000, () => {

    console.log("StudyBuddy backend running on port 3000");
});