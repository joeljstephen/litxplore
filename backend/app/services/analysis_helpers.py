import json
import logging
from typing import Any, Callable, TypeVar, Optional
from pydantic import ValidationError

from ..models.analysis import (
    AtAGlanceAnalysis,
    InDepthAnalysis,
)

logger = logging.getLogger(__name__)

T = TypeVar("T")


def extract_json_from_response(response_text: str) -> str:
    """Extract JSON from response, handling markdown code blocks and malformed JSON."""
    response_text = response_text.strip()
    
    # Remove markdown code blocks if present
    if "```json" in response_text.lower():
        # Find the json code block
        parts = response_text.split("```")
        for part in parts:
            part = part.strip()
            if part.lower().startswith("json"):
                response_text = part[4:].strip()  # Remove 'json' prefix
                break
    elif "```" in response_text:
        # Generic code block
        parts = response_text.split("```")
        if len(parts) >= 3:
            response_text = parts[1].strip()
    
    # Find the first { and last } to extract only the JSON object
    start = response_text.find('{')
    end = response_text.rfind('}')
    
    if start != -1 and end != -1 and end > start:
        response_text = response_text[start:end+1]
    else:
        # If we can't find braces, return original and let JSON parser handle the error
        return response_text
    
    return response_text


def parse_at_a_glance_json(response_text: str) -> AtAGlanceAnalysis:
    """Parse At-a-Glance JSON response."""
    try:
        json_text = extract_json_from_response(response_text)
        logger.debug(f"Extracted JSON text (first 200 chars): {json_text[:200]}")
        data = json.loads(json_text)
        return AtAGlanceAnalysis(**data)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse At-a-Glance JSON. Error: {str(e)}")
        logger.error(f"Response text (first 500 chars): {response_text[:500]}")
        raise


def parse_in_depth_json(response_text: str) -> InDepthAnalysis:
    """Parse in-depth analysis JSON response with robust error handling."""
    import re
    
    try:
        json_text = extract_json_from_response(response_text)
        logger.debug(f"Extracted in-depth JSON text (first 200 chars): {json_text[:200]}")
        
        # First attempt: parse as-is
        try:
            data = json.loads(json_text)
            return InDepthAnalysis(**data)
        except json.JSONDecodeError as e:
            logger.warning(f"Initial JSON parse failed: {str(e)}. Attempting to fix common issues...")
            
            # Second attempt: Fix unescaped newlines and other common issues
            # Strategy: Process each line and check if it's inside a string value
            # This is simpler and more reliable than complex regex
            
            lines = json_text.split('\n')
            fixed_lines = []
            in_string = False
            current_line = ""
            
            for line in lines:
                # Count unescaped quotes to determine if we're inside a string
                escaped = False
                quote_count = 0
                for char in line:
                    if char == '\\' and not escaped:
                        escaped = True
                        continue
                    if char == '"' and not escaped:
                        quote_count += 1
                    escaped = False
                
                # If odd number of quotes, we're changing string state
                if quote_count % 2 == 1:
                    in_string = not in_string
                
                # If we're in a string and this isn't the first line of it, 
                # we need to escape this as a continuation
                if in_string and current_line:
                    # This line is part of a string value, add it as \n
                    current_line += "\\n" + line.strip()
                elif in_string:
                    # Start of a string value
                    current_line = line
                else:
                    # Not in a string, or string ended on this line
                    if current_line:
                        fixed_lines.append(current_line)
                        current_line = ""
                    if not in_string:
                        # Complete line outside of string
                        fixed_lines.append(line)
            
            if current_line:
                fixed_lines.append(current_line)
            
            fixed_json = '\n'.join(fixed_lines)
            
            try:
                data = json.loads(fixed_json)
                logger.info("Successfully parsed JSON after fixing newlines")
                return InDepthAnalysis(**data)
            except json.JSONDecodeError as e2:
                logger.error(f"JSON parse still failed after fixes: {str(e2)}")
                logger.error(f"Original error position: line {e.lineno}, col {e.colno}")
                logger.error(f"Fixed JSON (chars around error): ...{fixed_json[max(0, e2.pos-100):e2.pos+100]}...")
                raise
                
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse in-depth analysis JSON. Error: {str(e)}")
        logger.error(f"Response text (first 500 chars): {response_text[:500]}")
        raise


async def invoke_llm_with_retry(
    llm: Any,
    prompt: str,
    response_parser: Callable[[str], T],
    fallback: T,
    max_retries: int = 2,
    timeout: int = 30
) -> T:
    """
    Invoke LLM with retry logic and JSON parsing.
    
    Args:
        llm: LangChain LLM instance
        prompt: Prompt to send to LLM
        response_parser: Function to parse LLM response
        fallback: Fallback value if parsing fails
        max_retries: Number of retry attempts
        timeout: Timeout in seconds
    
    Returns:
        Parsed response or fallback value
    """
    for attempt in range(max_retries):
        try:
            response = llm.invoke(prompt)
            response_text = response.content.strip()
            
            # Try to parse response
            try:
                return response_parser(response_text)
            except (json.JSONDecodeError, ValidationError) as e:
                if attempt < max_retries - 1:
                    logger.warning(
                        f"JSON parsing failed (attempt {attempt + 1}/{max_retries}): {str(e)}. Retrying..."
                    )
                    continue
                else:
                    logger.warning(
                        f"JSON parsing failed after {max_retries} attempts: {str(e)}. Using fallback."
                    )
                    return fallback
        
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(
                    f"LLM invocation failed (attempt {attempt + 1}/{max_retries}): {str(e)}. Retrying..."
                )
                continue
            else:
                logger.error(
                    f"LLM invocation failed after {max_retries} attempts: {str(e)}. Using fallback."
                )
                return fallback
    
    return fallback
