"""
Input validation utilities for security-critical operations.
Provides functions to validate and sanitize user inputs to prevent:
- Path traversal attacks
- Injection attacks
- Invalid input handling
"""

import re
from typing import Optional
from urllib.parse import urlparse

# Pattern for valid upload IDs: "upload_" followed by exactly 10 hex characters
UPLOAD_ID_PATTERN = re.compile(r"^upload_([0-9a-fA-F]{10})$")

# Pattern for valid arXiv paper IDs (e.g., "2301.12345", "2301.12345v1", "hep-th/9901001")
ARXIV_ID_PATTERN = re.compile(
    r"^(?:[a-z\-]+/\d{7}|\d{4}\.\d{4,5}(?:v\d+)?)$",
    re.IGNORECASE
)

# Pattern for valid content hash (10 hex characters)
CONTENT_HASH_PATTERN = re.compile(r"^[0-9a-fA-F]{10}$")

# Maximum lengths for various inputs
MAX_CHAT_MESSAGE_LENGTH = 4000
MAX_TOPIC_LENGTH = 500
MAX_TITLE_LENGTH = 255
MAX_REVIEW_CONTENT_LENGTH = 100000
MAX_CITATIONS_LENGTH = 200000
MAX_DOCUMENT_CONTENT_LENGTH = 50000


def extract_upload_hash(paper_id: str) -> Optional[str]:
    """
    Extract and validate the content hash from an upload paper ID.
    
    Args:
        paper_id: The paper ID to validate (e.g., "upload_a1b2c3d4e5")
    
    Returns:
        The extracted hash if valid, None otherwise.
        This prevents path traversal attacks by ensuring the hash
        only contains safe hex characters.
    """
    if not paper_id:
        return None
    
    match = UPLOAD_ID_PATTERN.match(paper_id)
    if not match:
        return None
    
    return match.group(1).lower()


def is_valid_arxiv_id(paper_id: str) -> bool:
    """
    Validate that a paper ID matches the arXiv ID format.
    
    Args:
        paper_id: The paper ID to validate
    
    Returns:
        True if the ID matches arXiv format, False otherwise.
    """
    if not paper_id:
        return False
    
    return bool(ARXIV_ID_PATTERN.match(paper_id))


def is_valid_paper_id(paper_id: str) -> bool:
    """
    Validate that a paper ID is either a valid upload ID or arXiv ID.
    
    Args:
        paper_id: The paper ID to validate
    
    Returns:
        True if the ID is valid, False otherwise.
    """
    if not paper_id:
        return False
    
    # Check if it's an upload ID
    if paper_id.startswith("upload_"):
        return extract_upload_hash(paper_id) is not None
    
    # Otherwise, check if it's a valid arXiv ID
    return is_valid_arxiv_id(paper_id)


def validate_content_hash(content_hash: str) -> bool:
    """
    Validate that a content hash contains only safe hex characters.
    
    Args:
        content_hash: The hash to validate
    
    Returns:
        True if valid, False otherwise.
    """
    if not content_hash:
        return False
    
    return bool(CONTENT_HASH_PATTERN.match(content_hash))


def validate_url_host(url: str, allowed_hosts: set) -> bool:
    """
    Validate that a URL's host is in the allowed list (SSRF protection).
    
    Args:
        url: The URL to validate
        allowed_hosts: Set of allowed hostnames
    
    Returns:
        True if the URL's host is allowed, False otherwise.
    """
    if not url:
        return False
    
    try:
        parsed = urlparse(url)
        return parsed.hostname in allowed_hosts
    except Exception:
        return False


def sanitize_string_input(
    value: str,
    max_length: int,
    strip_whitespace: bool = True,
    allow_empty: bool = False
) -> Optional[str]:
    """
    Sanitize a string input by enforcing length limits and trimming.
    
    Args:
        value: The string to sanitize
        max_length: Maximum allowed length
        strip_whitespace: Whether to strip leading/trailing whitespace
        allow_empty: Whether to allow empty strings after sanitization
    
    Returns:
        Sanitized string, or None if invalid.
    """
    if value is None:
        return None if allow_empty else None
    
    if not isinstance(value, str):
        return None
    
    if strip_whitespace:
        value = value.strip()
    
    if not value and not allow_empty:
        return None
    
    # Truncate to max length
    if len(value) > max_length:
        value = value[:max_length]
    
    return value
