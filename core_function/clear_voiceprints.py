#!/usr/bin/env python3
"""
Clear voiceprint database to fix embedding dimension mismatch
"""

import os

def clear_voiceprints():
    """Clear the voiceprint database"""
    voiceprint_files = ["voiceprints.pkl"]
    
    for file in voiceprint_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"- Removed {file}")
        else:
            print(f"- {file} not found")
    
    print("\n- Voiceprint database cleared!")
    print("You need to re-enroll all speakers with the new model.")

if __name__ == "__main__":
    print("=== Clear Voiceprint Database ===")
    confirm = input("This will delete all enrolled speakers. Continue? (y/n): ")
    
    if confirm.lower() == 'y':
        clear_voiceprints()
    else:
        print("Operation cancelled.")