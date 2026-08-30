import type { ReactNode } from "react";
import { useState } from "react";

interface CardProps 
{
    fileName: string;
    explanationContent: ReactNode;
    flashcardsContent: ReactNode;
    quizContent: ReactNode;
}

function StudyMaterialCard({fileName, explanationContent, flashcardsContent, quizContent}:CardProps)
{
    const [studyMode, setStudyMode] = useState<"explain" | "flashcards" | "quiz" | null>(null);

    return (
        <div>
            <h5>{fileName}</h5>
            <button onClick={() => setStudyMode("explain")}>Explanation</button>
            <button onClick={() => setStudyMode("flashcards")}>Flashcards</button>
            <button onClick={() => setStudyMode("quiz")}>Quiz</button>
            {studyMode === "explain" && explanationContent}
            {studyMode === "flashcards" && flashcardsContent}
            {studyMode === "quiz" && quizContent}
        </div>
    );
}
export default StudyMaterialCard;