import os
import weaviate
from langchain.vectorstores import Weaviate
from langchain.embeddings import OpenAIEmbeddings

WEAVIATE_URL = os.getenv("WEAVIATE_URL", "http://weaviate:8080")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Inicializa cliente weaviate
client = weaviate.Client(WEAVIATE_URL)

# Inicializa embeddings (usando OpenAI via OpenRouter)
embeddings = OpenAIEmbeddings(openai_api_key=OPENROUTER_API_KEY, openai_api_base="https://openrouter.ai/api/v1/")

# Função para criar/conectar vectorstore
vectorstore = Weaviate(client, "Document", "content", embedding=embeddings)

def add_document(text, metadata=None):
    vectorstore.add_texts([text], metadatas=[metadata or {}])

def query_rag(query, k=3):
    docs = vectorstore.similarity_search(query, k=k)
    return docs
