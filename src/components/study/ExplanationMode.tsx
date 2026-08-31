import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./ExplanationMode.css";

interface ExplanationProps 
{
    explanation: string | undefined;
    isGenerating: boolean;
    error: string | undefined;
    onGenerate: () => void;
}

function ExplanationMode({explanation, isGenerating, error, onGenerate}: ExplanationProps)
{
    return (
        <div className="explanation-mode">
            {error && (
                <p className="mode-error">{error}</p>
            )}

             {explanation ? (
                <>
                    <div className="explanation-header">
                        <div> 
                            <h4>Explanation</h4>
                            <p>AI-generated notes based on your material.</p>
                        </div>

                        <button 
                        className="secondary-action-button"
                        disabled={isGenerating}
                        onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Regenerate"} 
                        </button>
                    </div>

                    <div className="explanation-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {explanation}
                        </ReactMarkdown>
                    </div>
                </>   
                
                ) :
                (
                    <div className="mode-empty-state">
                        <h4>No explanation generated yet.</h4>
                        <p>Generate a clear explanation based on this PDF.</p>

                        <button 
                        className="primary-action-button"
                        disabled={isGenerating}
                        onClick={onGenerate}>
                        {isGenerating ? "Generating..." :"Generate Explanation"} 
                        </button>
                    </div>
                )}
                                
        </div>
    );
}

export default ExplanationMode;