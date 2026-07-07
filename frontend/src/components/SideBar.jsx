import "../style/SideBar.css"

export default function SideBar({ clearChat }) {
    return (
        <div className="side-bar-wrapper">
            <button
                className="clear-chat-button"
                onClick={clearChat}
            >Clear Chat</button>
        </div>
    )
}