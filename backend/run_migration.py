#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase III Migration Runner
Runs the SQL migration to create conversations and messages tables
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    exit(1)

# SQL migration script
SQL_MIGRATION = """
-- Phase III Migration: Add Conversation and Message tables for AI Chatbot

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
"""

def run_migration():
    """Execute the SQL migration"""
    print("🚀 Starting Phase III database migration...")
    print(f"📊 Database: {DATABASE_URL.split('@')[1].split('/')[0]}...")

    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        print("✅ Connected to database")

        # Execute migration
        print("⚙️  Creating conversations table...")
        print("⚙️  Creating messages table...")
        print("⚙️  Creating indexes...")

        cursor.execute(SQL_MIGRATION)
        conn.commit()

        print("✅ Migration completed successfully!")

        # Verify tables were created
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('conversations', 'messages')
            ORDER BY table_name
        """)

        tables = cursor.fetchall()
        print(f"\n📋 Tables created: {[t[0] for t in tables]}")

        # Verify indexes
        cursor.execute("""
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename IN ('conversations', 'messages')
            ORDER BY indexname
        """)

        indexes = cursor.fetchall()
        print(f"🔍 Indexes created: {[i[0] for i in indexes]}")

        cursor.close()
        conn.close()

        print("\n🎉 Phase III migration complete! You can now use the AI chatbot.")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        exit(1)

if __name__ == "__main__":
    run_migration()
