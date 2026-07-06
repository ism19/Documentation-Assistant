import "../style/ChatInput.css"

export default function ChatInput({query, setQuery, onSend, loading}) {
    return (
        <div className="input-box-wrapper">
            <input 
                className="chat-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        onSend()
                    }
                }}
                placeholder="Type a new message..."
            />
            <button 
                className={(loading || query.trim()) ? "send-button-disabled" : "send-button-enabled"}
                onClick={onSend}
                disabled={loading || query.trim() === ""}
            ><img src={(loading || query.trim() === "") ? "../../assets/send-button-disabled.svg" : "../../assets/send-button-yellow.svg"}/></button>
        </div>
    )
}