import os
import json
import asyncio
from typing import Dict, Any, Optional
import asyncpg
from datetime import datetime

class Database:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/open_meeting")
        self.pool = None
    
    async def connect(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(self.database_url)
        except Exception as e:
            print(f"Database connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
    
    async def get_meeting(self, meeting_id: str) -> Optional[Dict[str, Any]]:
        """Get meeting by ID"""
        if not self.pool:
            return {"id": meeting_id, "status": "processing", "progress": 0}
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM meetings WHERE id = $1",
                meeting_id
            )
            return dict(row) if row else None
    
    async def update_meeting_file(self, meeting_id: str, file_path: str):
        """Update meeting with uploaded file path"""
        if not self.pool:
            return
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE meetings SET file_path = $1, updated_at = NOW() WHERE id = $2",
                file_path, meeting_id
            )
    
    async def update_meeting_status(self, meeting_id: str, status: str, progress: int = 0):
        """Update meeting processing status"""
        if not self.pool:
            return
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE meetings SET status = $1, progress = $2, updated_at = NOW() WHERE id = $3",
                status, progress, meeting_id
            )
    
    async def update_meeting_error(self, meeting_id: str, error_message: str):
        """Update meeting with error message"""
        if not self.pool:
            return
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE meetings SET error_message = $1, updated_at = NOW() WHERE id = $2",
                error_message, meeting_id
            )
    
    async def update_meeting_results(self, meeting_id: str, results: Dict[str, Any]):
        """Update meeting with processing results"""
        if not self.pool:
            return
        async with self.pool.acquire() as conn:
            # Store transcript as text, convert dicts to JSON strings for JSONB columns
            transcript_data = results.get("transcript_data")
            # print(f"DEBUG: transcript_data = {transcript_data}")
            
            def to_json_string(data, field_name):
                if data is None:
                    print(f"DEBUG: {field_name} is None")
                    return None
                # print(f"DEBUG: {field_name} type = {type(data)}")
                # print(f"DEBUG: {field_name} FULL content = {data}")
                try:
                    result = json.dumps(data, ensure_ascii=False)
                    return result
                except (TypeError, ValueError) as e:
                    print(f"JSON conversion error for {field_name}: {data}")
                    print(f"Error: {e}")
                    # Return a safe fallback
                    return json.dumps({"error": f"Failed to serialize: {str(e)}"})
            
            hierarchical_data = to_json_string(results.get("hierarchical_data"), "hierarchical_data")
            speakers_data = to_json_string(results.get("speakers_data"), "speakers_data")
            ai_summary = to_json_string(results.get("ai_summary"), "ai_summary")
            topics_data = to_json_string(results.get("topics_data"), "topics_data")
            processing_info = to_json_string(results.get("processing_info"), "processing_info")
            
            await conn.execute("""
                UPDATE meetings SET 
                    transcript_data = $1::text,
                    hierarchical_data = $2::jsonb,
                    speakers_data = $3::jsonb,
                    ai_summary = $4::jsonb,
                    topics_data = $5::jsonb,
                    processing_info = $6::jsonb,
                    updated_at = NOW()
                WHERE id = $7
            """,
                transcript_data,
                hierarchical_data,
                speakers_data,
                ai_summary,
                topics_data,
                processing_info,
                meeting_id
            )
    
    async def create_meeting_log(self, meeting_id: str, log_type: str, message: str):
        """Create a log entry for meeting processing"""
        async with self.pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO meeting_logs (meeting_id, log_type, message, created_at)
                VALUES ($1, $2, $3, NOW())
            """, meeting_id, log_type, message)
    
    async def get_meeting_logs(self, meeting_id: str):
        """Get all logs for a meeting"""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM meeting_logs WHERE meeting_id = $1 ORDER BY created_at DESC",
                meeting_id
            )
            return [dict(row) for row in rows]