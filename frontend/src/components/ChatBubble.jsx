import { useState } from "react"

const [copied, setCopied] = useState(false)

function copyText() {
    setCopied(true)
    navigator.clipboard.writeText(content)
    setTimeout(() => setCopied(false), 2000)
}

export default function ChatBubble({role, content}) {
    return (role === "assistant") ? (
        <div className="assistant-msg-wrapper">
            <div className="assistant-msg">
                {content}
            </div>
            <button 
                className="copy-button" 
                onClick={copyText}
            ><img src="../../assets/copy-button-blue.svg"/></button>
        </div>
    ) : (
        <div className="user-msg">
            {content}
        </div>
    )
}