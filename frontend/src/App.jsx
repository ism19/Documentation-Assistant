import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import SideBar from "./components/SideBar";
import "./style/App.css"

function App() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("http://localhost:8000/history")
      .then(result => result.json())
      .then(data => setMessages(data))
  }, [])

  async function onSend() {
    setQuery("")
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

  async function clearChat() {
    await fetch("http://localhost:8000/history", {method: "DELETE"})
    setMessages([])
    setQuery("")
  }

  return (
    <div className="app-body">
      <div className="side-bar">
        <SideBar
          clearChat={clearChat}
        />
      </div>
      <div className="main-window">
        <ChatWindow
          messages={messages}
          query={query}
          setQuery={setQuery}
          onSend={onSend}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default App;