from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
import logging
import json

from ....models.paper import Paper
from ....services.paper_chat import PaperChatService
from ....core.auth import get_current_user
from ....models.user import User
from ....utils.error_utils import raise_validation_error, raise_not_found, raise_internal_error, ErrorCode
from ....utils.input_validation import is_valid_paper_id, MAX_CHAT_MESSAGE_LENGTH

router = APIRouter()
chat_service = PaperChatService()

logger = logging.getLogger(__name__)


@router.post("/{paper_id}/chat", operation_id="chatWithPaper")
async def chat_with_paper(
    paper_id: str,
    message: str = Query(
        ...,
        description="The user's question or message",
        min_length=1,
        max_length=MAX_CHAT_MESSAGE_LENGTH
    ),
    current_user: User = Depends(get_current_user)
):
    """
    Chat endpoint for paper-specific questions.
    
    Streams responses using Server-Sent Events (SSE) format.
    
    Args:
        paper_id: The ID of the paper to chat about
        message: The user's question or message (max 4000 characters)
        current_user: Authenticated user
    
    Returns:
        StreamingResponse with SSE-formatted chunks
    """
    try:
        if not paper_id:
            raise_validation_error(
                message="Paper ID is required",
                error_code=ErrorCode.VALIDATION_ERROR
            )
        
        # Validate paper_id format to prevent injection attacks
        if not is_valid_paper_id(paper_id):
            raise_validation_error(
                message="Invalid paper ID format",
                error_code=ErrorCode.VALIDATION_ERROR
            )
        
        if not message or not message.strip():
            raise_validation_error(
                message="Message is required",
                error_code=ErrorCode.VALIDATION_ERROR
            )
        
        async def generate():
            try:
                async for chunk in chat_service.chat_with_paper_stream(
                    paper_id,
                    message.strip()
                ):
                    yield f"data: {json.dumps(chunk)}\n\n"
            except Exception as e:
                logger.error(f"Error in chat stream: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to process chat for paper {paper_id}")
        raise_internal_error(
            message=f"Failed to process chat: {str(e)}",
            error_code=ErrorCode.INTERNAL_ERROR
        )
