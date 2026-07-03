export default function SideBar({ clearChat }) {
    return (
        <div className="side-bar-wrapper">
            <button
                onClick={clearChat}
            >Clear Chat</button>
        </div>
    )
}