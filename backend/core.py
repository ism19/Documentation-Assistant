import os
from typing import Any, Dict
from dotenv import load_dotenv

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.messages import ToolMessage
from langchain.tools import tool
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import json
import aiosqlite
from contextlib import asynccontextmanager


load_dotenv()

async def init_db():
    async with aiosqlite.connect("chat_history.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                sources TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

async def save_message(role: str, content: str, sources: list = None):
    async with aiosqlite.connect("chat_history.db") as db:
        await db.execute(
            "INSERT INTO messages (role, content, sources) VALUES (?, ?, ?)",
            (role, content, json.dumps(sources) if sources else None)
        )
        await db.commit()

async def get_history():
    messages = []
    async with aiosqlite.connect("chat_history.db") as db:
        async for row in await db.execute(
            "SELECT role, content, sources FROM messages ORDER BY timestamp ASC"
        ):
            messages.append({
                "role": row[0],
                "content": row[1],
                "sources": json.loads(row[2]) if row[2] else None          
            })
    return messages


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize embeddings model
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# initialize vector store
vectorstore = PineconeVectorStore(
    index_name="langchain-docs-2026", embedding=embeddings
)

# initialize chat model
model = init_chat_model("gpt-5.2", model_provider="openai")

@tool(response_format="content_and_artifact")
def retrieve_context(query: str):
    """Retrieve relevant documentation to help answer user queries about LangChain."""
    # retrieve top 4 most similar documents
    retrieved_docs = vectorstore.as_retriever().invoke(query, k=4)

    # serialize documents for the model
    serialized = "\n\n".join (
        (f"Source: {doc.metadata.get('source', 'Unknown')}\n\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    
    # return serialized content and raw docs
    return serialized, retrieved_docs

def run_llm(query: str) -> Dict[str, Any]:
    """
    Run the RAG pipeline to answer a query using retrieved documentation.

    Args: 
        query: The user's question

    Returns:
        Dictionary containing:
            - answer: The generated answer
            - context: List of retrieved documents
    """
    
    # create agent with retrieval tool
    system_prompt = (
        "You are a helpful AI assistant that answers questions about LangChain documentation. "
        "You have access to a tool that retrieves relevant documentation. "
        "Use the tool to find relevant information before answering questions. "
        "Always cite the sources you use in your answers. "
        "If you cannot find the answer in the retrieved documentation, say so."
    )

    agent = create_agent(model, tools=[retrieve_context], system_prompt=system_prompt)

    # create messages list
    messages = [{"role": "user", "content": query}]

    # invoke agent with messages
    response = agent.invoke({"messages": messages})

    # extract answer from last AI message
    answer = response["messages"][-1].content

    # extract context documents from ToolMessage artifacts
    context_docs = []
    for message in response["messages"]:
        if isinstance(message, ToolMessage) and hasattr(message, "artifact"):
            context_docs.extend(message.artifact)

    return {
        "answer": answer,
        "context": context_docs
    }

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
async def query(request: QueryRequest):
    await save_message("user", request.query)
    result = run_llm(request.query)
    sources = [doc.metadata.get("source") for doc in result["context"]]
    await save_message("assistant", result["answer"], sources)
    return result

@app.get("/history")
async def history():
    return await get_history()

@app.delete("/history")
async def delete_history():
    async with aiosqlite.connect("chat_history.db") as db:
        await db.execute("DELETE FROM messages")
        await db.commit()


