import type { ReactNode } from "react";
import { useState } from "react";
import "./StudyMaterialCard.css";

interface CardProps 
{
    fileName: string;
    explanationContent: ReactNode;
    flashcardsContent: ReactNode;
    quizContent: ReactNode;
    onDelete: () => void;
}

function StudyMaterialCard({fileName, explanationContent, flashcardsContent, quizContent, onDelete}:CardProps)
{
    const [studyMode, setStudyMode] = useState<"explain" | "flashcards" | "quiz" | null>(null);

    return (
        <div className="study-material-card">
            <div className="material-header">
                <span className="material-type">PDF</span>
                <h3>{fileName}</h3>

                <button
                className="material-delete-button"
                onClick={onDelete}>
                    Delete
                </button>
            </div>

            <div className="material-tabs">
                <button 
                className={`material-tab ${studyMode === "explain" ? "active" : ""}`}
                onClick={() => 
                    setStudyMode((prev) => prev === "explain" ? null : "explain")}>
                    Explanation
                </button>

                <button 
                className={`material-tab ${studyMode === "flashcards" ? "active" : ""}`}
                onClick={() => 
                    setStudyMode((prev) => prev === "flashcards" ? null : "flashcards")}>
                    Flashcards
                </button>

                <button 
                className={`material-tab ${studyMode === "quiz" ? "active" : ""}`}
                onClick={() => 
                    setStudyMode((prev) => prev === "quiz" ? null : "quiz")}>
                    Quiz
                </button>
            </div>

            <div className="study-mode-content">
                {studyMode === "explain" && explanationContent}
                {studyMode === "flashcards" && flashcardsContent}
                {studyMode === "quiz" && quizContent}
            </div>
        </div>
    );
}
export default StudyMaterialCard;