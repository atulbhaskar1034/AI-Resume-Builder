"""
RAG Engine for ResuMatch
Manages Vector DB (ChromaDB) for courses and jobs knowledge base
"""

import json
import os
import shutil
from typing import List
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")

# Initialize embeddings (Using OpenRouter)
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)


def ingest_knowledge_base() -> None:
    """
    Load jobs data and store in ChromaDB.
    NOTE: Courses are now fetched dynamically from YouTube API, not from static JSON.
    Only ingests if the database is empty.
    """
    # Check if DB exists and is populated
    if os.path.exists(DB_PATH) and len(os.listdir(DB_PATH)) > 0:
        print("Knowledge base already exists. Skipping ingestion.")
        return

    # Resolve paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    jobs_path = os.path.join(script_dir, "data", "raw_jobs.json")
    db_path = os.path.join(script_dir, "chroma_db")
    
    documents: List[Document] = []
    
    # NOTE: Courses are now fetched from YouTube API dynamically in workflow.py
    # The static nptel_courses.json file is no longer used
    print("Courses: Using YouTube API (dynamic fetch)")
    
    # Load jobs
    print("Loading jobs data...")
    try:
        with open(jobs_path, "r", encoding="utf-8") as f:
            jobs = json.load(f)
        
        for item in jobs:
            # Format tags as comma-separated string
            tags = ", ".join(item.get("tags", [])) if item.get("tags") else ""
            content = f"Job: {item.get('title', item.get('position', 'Unknown Job'))} at {item.get('company', 'Unknown Company')} - Skills: {tags}"
            doc = Document(
                page_content=content,
                metadata={
                    "type": "job",
                    "id": item.get("id", ""),
                    "title": item.get("title", item.get("position", "")),
                    "company": item.get("company", ""),
                    "url": item.get("url", ""),
                    "location": item.get("location", ""),
                    "tags": tags,
                    "date": item.get("date", "")
                }
            )
            documents.append(doc)
        print(f"Loaded {len(jobs)} jobs")
    except FileNotFoundError:
        print(f"Warning: Jobs file not found at {jobs_path}")
    except json.JSONDecodeError as e:
        print(f"Error parsing jobs JSON: {e}")
    
    if not documents:
        print("No documents to ingest!")
        return
    
    # Initialize Chroma
    print(f"Initializing ChromaDB at {db_path}...")
    vectorstore = Chroma(
        persist_directory=db_path,
        embedding_function=embeddings
    )
    
    # Check if database is empty
    existing_count = vectorstore._collection.count()
    
    if existing_count == 0:
        print(f"Database is empty. Adding {len(documents)} documents...")
        vectorstore.add_documents(documents)
        print(f"Successfully ingested {len(documents)} documents into ChromaDB!")
    else:
        print(f"Database already contains {existing_count} documents. Skipping ingestion.")
    
    print("Ingestion complete!")


def get_retriever(k: int = 5):
    """
    Get a retriever from the ChromaDB vectorstore.
    
    Args:
        k: Number of documents to retrieve (default: 5)
    
    Returns:
        A LangChain retriever object
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, "chroma_db")
    
    vectorstore = Chroma(
        persist_directory=db_path,
        embedding_function=embeddings
    )
    
    return vectorstore.as_retriever(search_kwargs={"k": k})


def clear_database() -> None:
    """
    Clear the ChromaDB database by removing the directory.
    Useful for re-ingesting data.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, "chroma_db")
    
    if os.path.exists(db_path):
        shutil.rmtree(db_path)
        print(f"Cleared database at {db_path}")
    else:
        print("No database to clear")


# Run ingestion when script is executed directly
if __name__ == "__main__":
    print("=" * 50)
    print("ResuMatch RAG Engine - Knowledge Base Ingestion")
    print("=" * 50)
    ingest_knowledge_base()
