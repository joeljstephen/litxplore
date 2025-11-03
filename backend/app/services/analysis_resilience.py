import logging
from typing import Optional, Tuple, Dict, Any
from ..models.analysis import AtAGlanceAnalysis

logger = logging.getLogger(__name__)


def create_fallback_at_a_glance(text_chunk: str) -> AtAGlanceAnalysis:
    """
    Create a fallback At-a-Glance analysis from raw text.
    
    Used when PDF extraction fails or LLM parsing fails.
    """
    lines = text_chunk.split("\n")
    non_empty_lines = [line.strip() for line in lines if line.strip()]
    
    # Extract first meaningful line as summary
    one_sentence_summary = (
        non_empty_lines[0][:100] + "..."
        if non_empty_lines
        else "Unable to extract summary from document"
    )
    
    # Create generic contributions
    key_contributions = [
        "Research contribution 1",
        "Research contribution 2",
        "Research contribution 3",
    ]
    
    # Extract methodology from text
    methodology = "See document for detailed methodology"
    for line in non_empty_lines:
        if "method" in line.lower() or "approach" in line.lower():
            methodology = line[:200]
            break
    
    # Extract key result
    key_result = "See document for key results"
    for line in non_empty_lines:
        if "result" in line.lower() or "finding" in line.lower():
            key_result = line[:200]
            break
    
    return AtAGlanceAnalysis(
        one_sentence_summary=one_sentence_summary,
        key_contributions=key_contributions,
        methodology=methodology,
        key_result=key_result,
    )


def extract_text_with_fallback(
    pdf_path: str,
) -> Tuple[str, Dict[int, str], bool]:
    """
    Extract text from PDF with fallback for malformed PDFs.
    
    Returns:
        Tuple of (full_text, page_map, is_fallback)
    """
    try:
        from langchain_community.document_loaders import PyPDFLoader
        
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()
        
        if not pages:
            logger.warning(f"PDF {pdf_path} has no pages")
            return "", {}, True
        
        full_text = ""
        page_map = {}
        
        for i, page in enumerate(pages):
            page_map[i] = page.page_content
            full_text += f"\n--- Page {i + 1} ---\n{page.page_content}"
        
        return full_text, page_map, False
        
    except Exception as e:
        logger.warning(
            f"Failed to extract text from PDF {pdf_path}: {str(e)}. Using fallback."
        )
        # Return empty text and empty page map to trigger fallback
        return "", {}, True
