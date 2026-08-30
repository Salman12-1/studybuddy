import type { Flashcard } from "../../types/study";

interface FlashcardProps
{
    cards: Flashcard[] | undefined;
    currentIndex: number;
    isAnswerShown: boolean;
    isGenerating: boolean;
    error: string | undefined;

    onGenerate: () => void;
    onShowAnswer: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

function FlashcardsMode({cards, currentIndex, isAnswerShown, isGenerating, error, onGenerate, onShowAnswer, onPrevious, onNext}: FlashcardProps)
{
    const currentFlashcard = cards?.[currentIndex];

    return (
        <>
            {error && (
                <p>{error}</p>
            )}


            {currentFlashcard ? (
                <>
                    <h4>Flashcards</h4>
                    <p>Card {currentIndex + 1} of {cards.length}</p>
                    <p><strong>Question: </strong> {currentFlashcard.question}</p>
                                            
                    {isAnswerShown ? (
                        <p><strong>Answer:</strong> {currentFlashcard.answer}</p>
                    ) : (
                        <button onClick={onShowAnswer}>
                            Show Answer
                        </button>
                    )}


                    <button 
                        disabled = {currentIndex === 0} 
                        onClick={onPrevious}>
                        Previous
                    </button>



                    <button
                        disabled={currentIndex === cards.length - 1}
                        onClick={onNext}>
                        Next
                    </button>

                    <button
                        disabled={isGenerating}
                        onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Regenerate flashcards"} 
                    </button>
                </>
            ):(
                <>
                    <h4>No flashcards generated yet.</h4>
                    <button 
                    disabled={isGenerating}
                    onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Generate Flashcards"} 
                    </button>
                </>
            )}
        </>
    );
}

export default FlashcardsMode;