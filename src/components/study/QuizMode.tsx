import type { QuizQuestion } from "../../types/study";

interface QuizProps
{
    questions: QuizQuestion[] | undefined;
    currentIndex: number;
    selectedAnswer: number | undefined;
    score: number | undefined;
    isGenerating: boolean;
    error: string | undefined;

    onGenerate: () => void;
    onSelectAnswer: (optionIndex: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onRetry: () => void;
}

function QuizMode({questions, currentIndex, selectedAnswer, score, isGenerating, error, onGenerate, onSelectAnswer, onPrevious, onNext, onSubmit, onRetry}: QuizProps)
{
    const currentQuestion = questions?.[currentIndex];
    return (
        <>
            {error && (
                <p>{error}</p>
            )}

            {currentQuestion ? 
            (
                <>
                    <h4>Quiz</h4>
                    <p>
                        Question {currentIndex + 1} of {questions.length}
                    </p>

                    <p>
                        <strong>{currentQuestion.question}</strong>
                    </p>

                    {currentQuestion.options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                            <label>
                                <input type="radio" name={currentQuestion.id} checked={selectedAnswer === optionIndex} 
                                disabled={score !== undefined}
                                onChange={() => onSelectAnswer(optionIndex)}/>
                                    {option} 
                            </label>
                                                
                        </div>
                    ))}


                    {score !== undefined &&
                        <p>{selectedAnswer === currentQuestion.correct_option ? "Correct" : "Incorrect"}</p>
                    }

                    {score !== undefined && selectedAnswer !== currentQuestion.correct_option &&
                        <p>Correct Answer: {currentQuestion.options[currentQuestion.correct_option]}</p>
                    }


                    <button 
                    disabled={currentIndex === 0} 
                    onClick={onPrevious}>
                        Previous
                    </button>

                    <button
                        hidden={currentIndex === questions.length - 1}
                        onClick={onNext}>
                            Next
                        </button>

                    <button
                    hidden={currentIndex !== questions.length - 1 || score !== undefined}
                    onClick={onSubmit}>
                        Submit
                    </button>


                    <button
                    hidden={score === undefined}
                    onClick={onRetry}>
                        Retry Quiz
                    </button>


                    {score !== undefined && (
                        <p>Your Score: {score} / {questions.length}</p>
                    )}

                    <button 
                    disabled={isGenerating}
                    onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Regenerate Quiz"} 
                    </button>
                </>
            )
            :(
                <>
                    <h4>No quiz generated yet.</h4>
                    <button 
                    disabled={isGenerating}
                    onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Generate Quiz"} 
                    </button>
                </>
            )}
                                
        </>
         
    );
}

export default QuizMode;