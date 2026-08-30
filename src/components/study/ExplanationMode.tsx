import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";


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
        <>
            {error && (
                <p>{error}</p>
            )}

             {explanation ? (
                <>
                    <h4>Explanation</h4>
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {explanation}
                    </ReactMarkdown>

                    <button 
                    disabled={isGenerating}
                    onClick={onGenerate}>
                    {isGenerating
                        ? "Generating..."
                        :"Regenerate Explanation"
                    } 
                    </button>
                </>
                ) :
                (
                    <>
                        <h4>No explanation generated yet.</h4>
                        <button 
                        disabled={isGenerating}
                        onClick={onGenerate}>
                        {isGenerating
                            ? "Generating..."
                            :"Generate Explanation"
                        } 
                        </button>
                    </>
                )}
                                
        </>
    );
}

export default ExplanationMode;