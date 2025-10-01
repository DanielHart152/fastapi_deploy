from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import asyncio
from pathlib import Path
from typing import Optional
import uuid
from datetime import datetime
import json

from meeting_processor import MeetingProcessor
from database import Database

app = FastAPI(title="Open Meeting Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
db = Database()
processor = MeetingProcessor()

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class ProcessingRequest(BaseModel):
    meeting_id: str
    file_path: Optional[str] = None
    youtube_url: Optional[str] = None
    settings: dict = {}

@app.on_event("startup")
async def startup_event():
    try:
        await db.connect()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Running without database connection")

@app.on_event("shutdown")
async def shutdown_event():
    await db.disconnect()

@app.post("/api/meetings/{meeting_id}/upload")
async def upload_file(meeting_id: str, file: UploadFile = File(...)):
    """Upload file for meeting processing"""
    try:
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{meeting_id}_{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update meeting with file path
        await db.update_meeting_file(meeting_id, str(unique_filename))
        
        return {
            "message": "File uploaded successfully",
            "file_path": str(unique_filename),
            "file_size": file_path.stat().st_size
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/meetings/{meeting_id}/process")
async def process_meeting(meeting_id: str, request: ProcessingRequest, background_tasks: BackgroundTasks):
    """Start processing a pre-recorded meeting"""
    try:
        # Check if already processing
        meeting = await db.get_meeting(meeting_id)
        if meeting and meeting.get("status") == "processing":
            return {
                "message": "Already processing",
                "meeting_id": meeting_id,
                "status": "processing"
            }
        
        # Update meeting status to processing
        await db.update_meeting_status(meeting_id, "processing")
        
        # Start background processing
        background_tasks.add_task(
            process_meeting_background,
            meeting_id,
            request.file_path,
            request.youtube_url,
            request.settings
        )
        
        return {
            "message": "Processing started",
            "meeting_id": meeting_id,
            "status": "processing"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

async def process_meeting_background(meeting_id: str, file_path: Optional[str], youtube_url: Optional[str], settings: dict):
    """Background task to process meeting"""
    try:
        print(f"Starting processing for meeting {meeting_id}")
        
        # Get meeting from database to find actual file
        meeting = await db.get_meeting(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting {meeting_id} not found")
        
        # Determine input source
        if meeting.get('file_path'):
            input_file = str(UPLOAD_DIR / meeting['file_path'])
            print(f"Processing file: {input_file}")
        elif youtube_url:
            input_file = await processor.download_youtube(youtube_url, meeting_id)
        else:
            raise ValueError("No input source provided")
        
        # Process the audio/video file
        result = await processor.process_meeting(input_file, settings)
        
        # Update database with results
        await db.update_meeting_results(meeting_id, result)
        
        # Update status to completed
        await db.update_meeting_status(meeting_id, "completed")
        
        print(f"Processing completed for meeting {meeting_id}")
        
    except Exception as e:
        print(f"Processing failed for meeting {meeting_id}: {str(e)}")
        await db.update_meeting_status(meeting_id, "failed")
        await db.update_meeting_error(meeting_id, str(e))

@app.get("/api/meetings/{meeting_id}/status")
async def get_meeting_status(meeting_id: str):
    """Get processing status of a meeting"""
    try:
        meeting = await db.get_meeting(meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        return {
            "meeting_id": meeting_id,
            "status": meeting.get("status", "unknown"),
            "progress": meeting.get("progress", 0),
            "error": meeting.get("error_message")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.get("/api/meetings/{meeting_id}/results")
async def get_meeting_results(meeting_id: str):
    """Get processing results of a meeting"""
    try:
        meeting = await db.get_meeting(meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        if meeting.get("status") != "completed":
            raise HTTPException(status_code=400, detail="Meeting processing not completed")
        
        return {
            "meeting_id": meeting_id,
            "transcript_data": meeting.get("transcript_data"),
            "hierarchical_data": meeting.get("hierarchical_data"),
            "speakers_data": meeting.get("speakers_data"),
            "ai_summary": meeting.get("ai_summary"),
            "topics_data": meeting.get("topics_data")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Results retrieval failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)