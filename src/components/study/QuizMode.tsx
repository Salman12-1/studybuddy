import type { QuizQuestion } from "../../types/study";
import "./QuizMode.css";

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
        <div className="quiz-mode">

            {error && (
                <p className="mode-error">{error}</p>
            )}

            {currentQuestion ? 
            (
                <>
                    <div className="quiz-header">
                        <h4>Quiz</h4>
                        <p>
                            Question {currentIndex + 1} of {questions.length}
                        </p>
                    </div>

                    <div className="quiz-question">
                        <p>
                            <strong>{currentQuestion.question}</strong>
                        </p>
                    </div>
                    
                    <div className="quiz-options">
                        {currentQuestion.options.map((option, optionIndex) => {
                        
                        let optionClass = "quiz-option";

                        if(score === undefined && selectedAnswer === optionIndex)
                        {
                            optionClass += " selected";
                        }
                        if(score !== undefined && optionIndex === currentQuestion.correct_option)
                        {
                            optionClass += " correct";
                        }
                        if (score !== undefined && selectedAnswer === optionIndex && optionIndex !== currentQuestion.correct_option)
                        {
                            optionClass += " incorrect";
                        }

                        return (
                            <div key={optionIndex} className={optionClass}>
                                <label>
                                    <input 
                                    type="radio" 
                                    name={currentQuestion.id} 
                                    checked={selectedAnswer === optionIndex} 
                                    disabled={score !== undefined}
                                    readOnly
                                    onClick={() => onSelectAnswer(optionIndex)}/>
                                        {option} 
                                </label>
                                                    
                            </div>
                        )})}
                    </div>
                    
                    {score !== undefined && (
                        <div className={`quiz-feedback ${
                            selectedAnswer === currentQuestion.correct_option
                                ? "correct"
                                : "incorrect"
                            }`}>
                            
                            <p>{selectedAnswer === currentQuestion.correct_option ? "✓ Correct" : "✕ Incorrect"}</p>
                            

                            {selectedAnswer !== currentQuestion.correct_option &&
                                <p>Correct Answer: {currentQuestion.options[currentQuestion.correct_option]}</p>
                            }
                        </div>
                    )}
                    
                    <div className="quiz-navigation">
                        <button 
                        disabled={currentIndex === 0} 
                        onClick={onPrevious}>
                            ← Previous
                        </button>

                        <button
                            hidden={currentIndex === questions.length - 1}
                            onClick={onNext}>
                                Next →
                            </button>

                        <button
                        className="quiz-submit-button"
                        hidden={currentIndex !== questions.length - 1 || score !== undefined}
                        onClick={onSubmit}>
                            Submit
                        </button>
                    </div>
                    
                    <div className="quiz-footer">

                        <div className="quiz-footer-left">
                            {score !== undefined && (
                                <p className="quiz-score">
                                    Your score:{" "}
                                    <strong>
                                        {score} / {questions.length}
                                    </strong>
                                </p>
                            )}
                        </div>

                        <div className="quiz-footer-actions">
                            <button
                            hidden={score === undefined}
                            onClick={onRetry}>
                                Retry Quiz
                            </button>

                            <button 
                            disabled={isGenerating}
                            onClick={onGenerate}>
                                {isGenerating ? "Generating..." :"Regenerate"} 
                            </button>
                        </div>
                    </div>
                </>
            )
            :(
                <div className="mode-empty-state">  
                        <h4>No quiz yet.</h4>
                        <p>Generate a quiz from this PDF to test yourself.</p>
                        
                        <button 
                        className="primary-action-button"
                        disabled={isGenerating}
                        onClick={onGenerate}>
                            {isGenerating ? "Generating..." :"Generate Quiz"} 
                        </button>
                </div>
            )}
                                
        </div>
         
    );
}

export default QuizMode;