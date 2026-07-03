export default function ChatInput({query, setQuery, onSend}) {
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
                className="send-button"
                onClick={onSend}
            ><img src="../../assets/send-button-yellow.svg"/></button>
        </div>
    )
}