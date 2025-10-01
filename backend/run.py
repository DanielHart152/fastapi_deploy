#!/usr/bin/env python3
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )