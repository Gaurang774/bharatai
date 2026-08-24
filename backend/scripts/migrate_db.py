import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import engine, Base
from models.conversation import conversation_documents
from sqlalchemy import inspect

def migrate():
    inspector = inspect(engine)
    if not inspector.has_table("conversation_documents"):
        print("Creating table 'conversation_documents'...")
        conversation_documents.create(engine)
        print("Table 'conversation_documents' created.")
    else:
        print("Table 'conversation_documents' already exists.")

if __name__ == "__main__":
    migrate()
