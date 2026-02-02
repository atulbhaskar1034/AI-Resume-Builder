
import os
import sys
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from rag_engine import ingest_knowledge_base, get_retriever

# Load env vars
load_dotenv()

# Setup logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_rag():
    print("Testing RAG Engine...")
    
    # Check if data files exist
    script_dir = os.path.dirname(os.path.abspath(__file__))
    courses_path = os.path.join(script_dir, "data", "nptel_courses.json")
    print(f"Courses path: {courses_path} Exists: {os.path.exists(courses_path)}")
    
    # Force ingest
    print("Forcing ingestion...")
    ingest_knowledge_base()
    
    # Initialize DB client directly to check count
    db_path = os.path.join(script_dir, "chroma_db")
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    vector_db = Chroma(
        persist_directory=db_path,
        embedding_function=embeddings,
        collection_name="resumatch_knowledge"
    )
    
    # Check count
    # Chroma doesn't have simple .count() on the object sometimes, but let's try direct collection access
    try:
        count = vector_db._collection.count()
        print(f"Total documents in Vector DB: {count}")
    except Exception as e:
        print(f"Could not get count: {e}")

    # Test retrieval
    print("\nTesting retrieval for 'Python':")
    retriever = get_retriever()
    docs = retriever.invoke("Python")
    print(f"Found {len(docs)} docs for 'Python'")
    for i, doc in enumerate(docs):
        print(f"Doc {i+1}: {doc.page_content[:100]}...")

if __name__ == "__main__":
    test_rag()
