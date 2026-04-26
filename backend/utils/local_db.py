"""
Local SQLite-based persistence layer.
Primary storage when Supabase is unavailable.
"""
import sqlite3
import os
import uuid
from datetime import datetime
import json

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'vitallog_local.db')

def _get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT,
            role TEXT,
            content TEXT,
            metadata TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ─── Users ──────────────────────────────────────────────────────────────────

def get_or_create_user(email: str) -> str:
    conn = _get_conn()
    row = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if row:
        conn.close()
        return row['id']
    user_id = str(uuid.uuid4())
    conn.execute("INSERT INTO users (id, email) VALUES (?, ?)", (user_id, email))
    conn.commit()
    conn.close()
    return user_id

# ─── Conversations ──────────────────────────────────────────────────────────

def create_local_conversation(user_id: str, title: str) -> dict:
    conn = _get_conn()
    conv_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO conversations (id, user_id, title, created_at) VALUES (?, ?, ?, ?)",
        (conv_id, user_id, title, now)
    )
    conn.commit()
    conn.close()
    return {"id": conv_id, "title": title, "created_at": now}

def get_user_conversations(user_id: str) -> list:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_conversation(conversation_id: str):
    conn = _get_conn()
    conn.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
    conn.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
    conn.commit()
    conn.close()

# ─── Messages ────────────────────────────────────────────────────────────────

def save_local_message(conversation_id: str, role: str, content: str, metadata: dict = None):
    conn = _get_conn()
    msg_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO messages (id, conversation_id, role, content, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (msg_id, conversation_id, role, content, json.dumps(metadata) if metadata else None, now)
    )
    conn.commit()
    conn.close()

def get_local_chat_history(conversation_id: str) -> list:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        (conversation_id,)
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d.get('metadata'):
            try:
                d['metadata'] = json.loads(d['metadata'])
            except:
                d['metadata'] = {}
        result.append(d)
    return result

def get_all_local_metadata() -> list:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT metadata FROM messages WHERE metadata IS NOT NULL AND role = 'assistant'"
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        try:
            m = json.loads(r['metadata'])
            if m:
                result.append(m)
        except:
            pass
    return result
