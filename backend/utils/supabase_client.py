import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_ANON_KEY", "")

try:
    if url and key:
        supabase: Client = create_client(url, key)
    else:
        supabase = None
        print("Warning: Supabase credentials missing. Local-only mode active.")
except Exception as e:
    supabase = None
    print(f"Warning: Supabase initialization failed ({e}). Local-only mode active.")

import uuid

def is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

def get_chat_history(conversation_id: str):
    if not supabase or not is_valid_uuid(conversation_id): return []
    response = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
    return response.data

def save_message(conversation_id: str, role: str, content: str, metadata: dict = None):
    if not supabase or not is_valid_uuid(conversation_id): return
    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "metadata": metadata
    }).execute()

def create_conversation(user_id: str, title: str):
    if not supabase: return {"id": "local-session"}
    response = supabase.table("conversations").insert({
        "user_id": user_id,
        "title": title
    }).execute()
    return response.data[0]
def get_all_metadata():
    if not supabase: return []
    response = supabase.table("messages").select("metadata").not_.is_("metadata", "null").execute()
    return [m['metadata'] for m in response.data if m['metadata']]

def get_latest_metrics():
    if not supabase: return {}
    # Get latest 5 messages with metadata to find metrics
    response = supabase.table("messages").select("metadata").not_.is_("metadata", "null").order("created_at", {"ascending": False}).limit(10).execute()
    
    metrics = {}
    for m in response.data:
        if m['metadata'] and 'entities' in m['metadata']:
            for ent in m['metadata']['entities']:
                if ent['name'] not in metrics:
                    metrics[ent['name']] = ent['value']
    return metrics
