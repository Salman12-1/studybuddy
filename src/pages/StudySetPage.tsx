import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ExplanationMode from "../components/study/ExplanationMode";
import FlashcardsMode from "../components/study/FlashcardsMode";
import QuizMode from "../components/study/QuizMode";
import useExplanation from "../hooks/useExplanation";
import useFlashcards from "../hooks/useFlashcards";
import type { StudySet, StudyMaterial} from "../types/study";
import useQuiz from "../hooks/useQuiz";
import StudyMaterialCard from "../components/study/StudyMaterialCard";
import AppHeader from "../components/AppHeader";
import "./StudySetPage.css";

function StudySetPage()
{
    const [studySet, setStudySet] = useState<StudySet | null>(null);
    const [loading, setLoading] = useState(true);
    const [materialsLoading, setMaterialsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const 
    {
        explanations,
        explainingIds,
        explainErrors,
        explainMaterial,
        loadSavedExplanations,
    } = useExplanation();

    const 
    {
        flashcardsByMaterial,
        generatingFlashcardIds,
        flashcardErrors,
        flashcardIndexes,
        shownAnswerIds,
        loadFlashcards,
        generateFlashcards,
        previousCard,
        nextCard,
        toggleAnswer,
    } = useFlashcards();

    const 
    {
        quizQuestionsByMaterial,
        generatingQuizIds,
        quizIndexes,
        quizAnswersByMaterial,
        quizScore,
        quizError,
        loadQuizQuestions,
        generateQuiz,
        selectAnswer,
        retryQuiz,
        previousQuestion,
        nextQuestion,
        submitQuiz,
    } = useQuiz();


    const { id } = useParams();
    const { session } = useAuth();

    async function extractMaterial(materialId: string) 
    {
        if(!session)
        {
            throw new Error("No session");
        }

        const url = `http://localhost:3000/api/materials/${materialId}/extract`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        const data = await response.json();

        if(!response.ok)
        {
            throw new Error(data.error || "Failed to extract material");
        }

        return data;
    }

    async function loadStudySet() 
    {
        setLoading(true);
        setStudySet(null);

        if(!id)
        {
            setLoading(false);
            return;
        }

        const {data, error} = await supabase
        .from("study_sets")
        .select("id, title")
        .eq("id", id)
        .maybeSingle();
        
        if(error)
        {
            console.error(error.message);
            setLoading(false);
            return;
        }

        setStudySet(data);
        setLoading(false);

    }

    async function removeMaterial(materialId: string, storagePath: string)
    {
        const {error: tableError} = await supabase
        .from("study_materials")
        .delete()
        .eq("id", materialId);

        if(tableError)
        {
            console.error(tableError);
            return false;
        }


        const {error: storageError} = await supabase.storage
        .from("study-materials")
        .remove([storagePath]);

        if(storageError)
        {
            console.log(storageError);
        }

        return true;
    }


    async function deleteMaterial(material: StudyMaterial)
    {
        const confirmed = window.confirm(
            `Delete "${material.file_name}"? Its explanation, flashcards, and quiz will also be deleted.`
        );  

        if(!confirmed)
            return;

        const deleted = await removeMaterial(material.id, material.storage_path);

        if(!deleted)
            return;

        await loadMaterials();
    }


    async function uploadMaterial()
    {
        if(!selectedFile || !id)
        {
            return;
        }

        setIsUploading(true);
        setUploadError("");

        try
        {
            const path = id + "/" + crypto.randomUUID() + ".pdf";

            const {error: errorStorage} = await supabase.storage
            .from("study-materials")
            .upload(path, selectedFile);

            if(errorStorage)
            {
                console.error(errorStorage);
                setUploadError("Failed to upload the PDF. Please try again.");
                return;
            }
            console.log("Storage Upload successful");

            const {data: newMaterial, error: errorTable} = await supabase
            .from("study_materials")
            .insert({
                study_set_id: id,
                file_name: selectedFile.name,
                storage_path: path,
                mime_type: selectedFile.type, 
            })
            .select("id")
            .single();

            if(errorTable)
            {
                const {error: errorRemove} = await supabase.storage
                .from("study-materials")
                .remove([path]);

                if(errorRemove)
                {
                    console.error(errorRemove);
                }
                console.error(errorTable);
                setUploadError("Failed to save the uploaded material.");
                return;
            }

            try
            {
                await extractMaterial(newMaterial.id);
            }
            catch(error)
            {
                console.error(error);

                const removed = await removeMaterial(newMaterial.id, path);

                if (!removed)
                {
                    console.error("Failed to clean up material after extraction failure.");
                }

                setUploadError("Failed to process the PDF. Please try again.");
                return;
            }

            console.log("Material upload and extraction successful");

            await loadMaterials();
            setSelectedFile(null);


        }
        catch (error)
        {
            console.error(error);
            setUploadError("Something went wrong while processing the PDF.");
        }
        finally
        {
            setIsUploading(false);
        }
    }

    async function loadMaterials()
    {   
        setMaterialsLoading(true);

        try
        {
            if (!id)
            {
                return;
            }
            const{data, error} = await supabase
            .from("study_materials")
            .select("id, file_name, storage_path, mime_type, explanation")
            .eq("study_set_id", id)
            .order("created_at", { ascending: true });

            if(error)
            {
                console.error(error);
                return;
            }

            setMaterials(data);
            loadSavedExplanations(data);

            const materialIds = data.map((material) => material.id);

            await loadFlashcards(materialIds)
            await loadQuizQuestions(materialIds)
        }
        catch (error)
        {
            console.error("Failed to load materials:", error);
        }
        finally
        {
            setMaterialsLoading(false);
        }
    }


    useEffect(() => {
        loadStudySet();
        loadMaterials();
    }, [id]);




    if (loading) 
    {
        return (
            <div className="study-set-page">
                <AppHeader />

                <main className="study-set-container">
                    <div className="page-state">
                        <p className="page-state-message">
                            Loading study set...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (!studySet) 
    {
        return (
            <div className="study-set-page">
                <AppHeader />

                <main className="study-set-container">
                    <div className="page-state">
                        <h2>Study set not found</h2>
                        <p>
                            This study set may have been deleted or is no longer available.
                        </p>

                        <Link to="/dashboard">
                            ← Back to study sets
                        </Link>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div className="study-set-page">
            <AppHeader />

            <main className="study-set-container">
                <Link to="/dashboard" className="back-link">
                    ← Back to study sets
                </Link>

                <div className="study-set-intro">
                    <h1>{studySet.title}</h1>
                    <p>Study from your uploaded course material.</p>
                </div>

                <div className="upload-section">
                    <header className="upload-header">
                        <h3>Add study material</h3>
                        <p>Upload a PDF and StudyBuddy will turn it into explanations, flashcards, and quizzes.</p>
                    </header>
                    <div className="upload-panel">
                        <div className="upload-info">
                            <input 
                            id="pdf-upload"
                            className="file-input"
                            type="file" 
                            accept="application/pdf" 
                            disabled={isUploading}
                            onChange={(event) => 
                                setSelectedFile(event.target.files?.[0] ?? null)} 
                            />

                            <label htmlFor="pdf-upload" className="choose-file-button">
                                Choose PDF
                            </label>

                            <span className="selected-file-name">
                                {selectedFile ? selectedFile.name : "No file selected"}
                            </span>
                        </div>

                        <button
                            className="upload-button"
                            disabled={!selectedFile || isUploading}
                            onClick={uploadMaterial}>
                            {isUploading ? "Uploading & processing..." : "Upload"}
                        </button>

                        {uploadError && (
                            <p className="upload-error">{uploadError}</p>
                        )}
                    </div>
                </div>

                
                <h2>Your Materials</h2>

                {materialsLoading ? (
                    <div className="materials-state">
                        <p>Loading materials...</p>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="materials-state">
                        <h3>No materials yet</h3>
                        <p>
                            Upload your first PDF above to start studying.
                        </p>
                    </div>
                ) : null}
                


                {!materialsLoading && materials.map((material) => {

                const cards = flashcardsByMaterial[material.id];
                const currentIndex = flashcardIndexes[material.id] ?? 0;
                
                const quizQuestions = quizQuestionsByMaterial[material.id];
                const currentQuizIndex = quizIndexes[material.id] ?? 0;
                const currentQuizQuestion = quizQuestions?.[currentQuizIndex];  
                const selectedQuizAnswer = currentQuizQuestion ? quizAnswersByMaterial[material.id]?.[currentQuizQuestion.id] : undefined;
                

                return(
                    <StudyMaterialCard
                        key={material.id} 
                        fileName={material.file_name}
                        explanationContent=
                        {
                            <ExplanationMode
                                explanation={explanations[material.id]}
                                isGenerating={explainingIds.has(material.id)}
                                error={explainErrors[material.id]}
                                onGenerate={() => explainMaterial(material.id)}
                            />
                        }
                        flashcardsContent=
                        {
                            <FlashcardsMode 
                                cards={cards}
                                currentIndex={currentIndex}
                                isAnswerShown={shownAnswerIds.has(material.id)}
                                isGenerating={generatingFlashcardIds.has(material.id)}
                                error={flashcardErrors[material.id]}
                                onGenerate={() => generateFlashcards(material.id)}
                                onToggleAnswer={() => toggleAnswer(material.id)}
                                onPrevious={() => {previousCard(material.id)}}
                                onNext={() => {nextCard(material.id)}}
                            />
                        }
                        quizContent=
                        {
                            <QuizMode 
                                questions={quizQuestions}
                                currentIndex={currentQuizIndex}
                                selectedAnswer={selectedQuizAnswer}
                                score={quizScore[material.id]}
                                isGenerating={generatingQuizIds.has(material.id)}
                                error={quizError[material.id]}
                                onGenerate={() => generateQuiz(material.id)}
                                onSelectAnswer={(optionIndex) => {
                                    if (!currentQuizQuestion) return;
                                    selectAnswer(material.id, currentQuizQuestion.id, optionIndex);
                                }}
                                onPrevious={() => previousQuestion(material.id)}
                                onNext={() => nextQuestion(material.id)}
                                onSubmit={() => submitQuiz(material.id)}
                                onRetry={() => retryQuiz(material.id)}
                            />
                        }
                        onDelete={() => deleteMaterial(material)}
                    />  
                );
            })}

            </main>
        </div>
    );
}
export default StudySetPage;


/*
This page represents one specific study set. It reads the study-set ID from the URL using useParams, loads that study set from Supabase, 
and loads its uploaded study materials. It also lets users select and securely upload PDF files to the study-materials Storage bucket, 
creates matching records in the study_materials database table, removes uploaded files if the database insert fails,
and updates the material list immediately after a successful upload.
*/