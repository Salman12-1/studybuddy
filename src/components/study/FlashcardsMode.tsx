import type { Flashcard } from "../../types/study";
import "./FlashcardsMode.css";

interface FlashcardProps
{
    cards: Flashcard[] | undefined;
    currentIndex: number;
    isAnswerShown: boolean;
    isGenerating: boolean;
    error: string | undefined;

    onGenerate: () => void;
    onToggleAnswer: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

function FlashcardsMode({cards, currentIndex, isAnswerShown, isGenerating, error, onGenerate, onToggleAnswer, onPrevious, onNext}: FlashcardProps)
{
    const currentFlashcard = cards?.[currentIndex];

    return (
        <div className="flashcards-mode">

            {error && (
                <p className="mode-error">{error}</p>
            )}

            {currentFlashcard ? (
                <>
                    <div className="flashcards-header">
                        <h4>Flashcards</h4>
                        <p>Card {currentIndex + 1} of {cards.length}</p>
                    </div>

                    <div
                    className="flashcard"
                    onClick={onToggleAnswer}>

                        <div className={`flashcard-inner ${isAnswerShown ? "flipped" : ""}`}>

                            <div className="flashcard-front">
                                <span className="flashcard-label">QUESTION</span>
                                <p>{currentFlashcard.question}</p>
                                <p>Click to reveal</p>
                            </div>

                            <div className="flashcard-back">
                                <span className="flashcard-label">ANSWER</span>
                                <p>{currentFlashcard.answer}</p>
                                <p>Click to flip back</p>
                            </div>

                        </div>
                    </div>

                    <div className="flashcard-navigation">
                        <button 
                            disabled = {currentIndex === 0} 
                            onClick={onPrevious}>
                            ← Previous
                        </button>

                        <button
                            disabled={currentIndex === cards.length - 1}
                            onClick={onNext}>
                            Next →
                        </button>
                    </div>

                    <div className="flashcards-footer">
                        <button
                            disabled={isGenerating}
                            onClick={onGenerate}>
                            {isGenerating ? "Generating..." :"Regenerate"} 
                        </button>
                    </div>
                </>
            ):(
                <div className="mode-empty-state">
                    <h4>No flashcards yet.</h4>
                    <p>Generate flashcards from this PDF to start reviewing.</p>

                    <button  
                    className="primary-action-button"
                    disabled={isGenerating}
                    onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Generate Flashcards"} 
                    </button>
                </div>
            )}
        </div>
    );
}

export default FlashcardsMode;