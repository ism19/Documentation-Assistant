import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useRef, useEffect } from "react";
import "../style/ChatWindow.css"

export default function ChatWindow({ messages, query, setQuery, onSend, loading }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    return (
        <div className="chat-window-wrapper">
            <h1>LangChain Documentation Helper</h1>
            <div className="chat-scroll-window">
                {messages?.map((msg, i) => (
                    <ChatBubble key={i} message={msg}/>
                ))}
                <div ref={bottomRef}/>
            </div>
            <ChatInput query={query} setQuery={setQuery} onSend={onSend} loading={loading}/>
        </div>
    )
}