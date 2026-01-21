from fastapi import APIRouter, Response, status
from typing import List
from ....models.paper import Paper, ReviewContent
from ....services.document_service import DocumentService
from ....utils.error_utils import raise_validation_error, raise_internal_error, ErrorCode
from pydantic import BaseModel, Field, validator
from datetime import datetime

class DocumentGenerateRequest(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=50000,
        description="The content of the review (max 50,000 characters)"
    )
    citations: List[Paper] = Field(
        ...,
        min_length=1,
        max_length=200,
        description="List of cited papers (max 200 papers)"
    )
    topic: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="The review topic (max 500 characters)"
    )
    format: str = Field(
        ...,
        pattern="^(pdf|latex)$",
        description="Output format (pdf or latex)"
    )

    @validator('topic')
    def topic_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Topic cannot be empty')
        return v.strip()
    
    @validator('content')
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Literature review content...",
                "citations": [
                    {
                        "id": "paper_id",
                        "title": "Paper Title",
                        "authors": ["Author 1", "Author 2"],
                        "summary": "Paper summary",
                        "published": datetime.now().isoformat(),
                        "url": "http://example.com/paper.pdf"
                    }
                ],
                "topic": "Research Topic",
                "format": "pdf"
            }
        }

router = APIRouter()
document_service = DocumentService()

@router.post("/generate", response_class=Response, status_code=status.HTTP_200_OK, operation_id="generateDocument")
async def generate_document(request: DocumentGenerateRequest):
    """Generate a document in PDF or LaTeX format"""
    try:
        content = await document_service.generate_document(
            content=request.content,
            citations=request.citations,
            topic=request.topic,
            format=request.format
        )
        
        media_type = "application/pdf" if request.format == "pdf" else "application/x-latex"
        filename = f"literature-review.{request.format}"
        
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": media_type
            }
        )
        
    except ValueError as e:
        raise_validation_error(
            message=str(e),
            error_code=ErrorCode.VALIDATION_ERROR
        )
    except Exception as e:
        raise_internal_error(
            message=f"Document generation failed: {str(e)}",
            error_code=ErrorCode.INTERNAL_ERROR
        )
