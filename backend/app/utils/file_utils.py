"""File utility functions for LitXplore."""
import os
import logging
from typing import List
from app.utils.input_validation import extract_upload_hash


async def cleanup_uploaded_pdfs(paper_ids: List[str]) -> dict:
    """Delete uploaded PDF files to free up space.

    This function is intentionally not dependent on user authentication to allow
    cleanup even when tokens expire during long-running operations.

    Uses path traversal protection to ensure only valid upload files are deleted.

    Args:
        paper_ids: List of paper IDs to clean up

    Returns:
        dict with cleanup status
    """
    try:
        upload_dir = "uploads"
        for paper_id in paper_ids:
            # Validate upload ID format to prevent path traversal attacks
            content_hash = extract_upload_hash(paper_id)
            if not content_hash:
                continue

            pdf_path = os.path.join(upload_dir, f"{content_hash}.pdf")
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
                logging.info(f"Deleted PDF file: {pdf_path}")
    except Exception as e:
        # Log the error but don't fail the request
        logging.error(f"Error cleaning up PDF files: {str(e)}")
    return {"cleanup_status": "completed"}
