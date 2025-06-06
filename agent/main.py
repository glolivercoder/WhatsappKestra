import os
from fastapi import FastAPI, Request
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
from langchain.llms import OpenAI
from langchain.chains import ConversationChain
from rag_utils import add_document, query_rag

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
WHATSAPP_API_URL = os.getenv("WHATSAPP_API_URL")

app = FastAPI()

class Message(BaseModel):
    from_number: str
    message: str

class IngestRequest(BaseModel):
    text: str
    metadata: dict = None

# Inicialização do LangChain com OpenRouter
llm = OpenAI(
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1/",
)
conversation = ConversationChain(llm=llm)

@app.post("/webhook")
def webhook(msg: Message):
    # Busca contexto relevante via RAG
    docs = query_rag(msg.message, k=3)
    context = "\n".join([d.page_content for d in docs]) if docs else ""
    prompt = f"Contexto:\n{context}\n\nUsuário: {msg.message}\nAgente:"
    resposta = conversation.run(prompt)
    # Envia resposta de volta ao WhatsApp
    requests.post(f"{WHATSAPP_API_URL}/message", json={
        "to": msg.from_number,
        "body": resposta
    })
    return {"status": "ok", "resposta": resposta}

@app.post("/ingest")
def ingest(req: IngestRequest):
    add_document(req.text, req.metadata)
    return {"status": "documento adicionado"}

@app.get("/")
def health():
    return {"status": "ok"}
