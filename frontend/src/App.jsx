import { useState } from "react";
import ChatBubble from "./components/ChatBubble";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import SideBar from "./components/SideBar";

function App() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  async function onSend() {
    setLoading(true)
    setMessages(prev => [...prev, { role: "user", content: query }])

    const response = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    })

    const data = await response.json()

    setMessages(prev => [...prev, {
      role: "assistant",
      content: data.answer,
      sources: data.context.map(doc => doc.metadata.source)
    }])
    setLoading(false)
  }
}

export default App;