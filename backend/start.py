#!/usr/bin/env python3
"""
Backend startup script for Open Meeting
"""
import os
import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Add core_function directory to Python path
core_function_dir = current_dir.parent / "core_function"
sys.path.insert(0, str(core_function_dir))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

if __name__ == "__main__":
    import uvicorn
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"Starting Open Meeting Backend on {host}:{port}")
    print(f"Core functions path: {core_function_dir}")
    print(f"Reload enabled: {reload}")
    
    # Start the server
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )