import { useState } from "react"
import "../style/ChatBubble.css"
import ReactMarkdown from "react-markdown"

export default function ChatBubble({ message }) {
    const [copied, setCopied] = useState(false)

    function copyText() {
        setCopied(true)
        navigator.clipboard.writeText(message.content)
        setTimeout(() => setCopied(false), 2000)
    }

    return (message.role === "assistant") ? (
        <div className="assistant-msg-wrapper">
            <div className="assistant-msg">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.sources && (
                    <div className="sources">
                        <h3 id="sources">Sources</h3>
                        {[...new Set(message.sources)].map((src, i) => (
                            <a key={i} href={src} target="_blank">{src}</a>
                        ))}
                    </div>
                )}
            </div>
            <button 
                className="copy-button" 
                onClick={copyText}
            ><img src={copied ? "../../assets/checkmark-white.svg" : "../../assets/copy-button-blue.svg"}/></button>
        </div>
    ) : (
        <div className="user-msg">
            <p>{message.content}</p>
        </div>
    )
}