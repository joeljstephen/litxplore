from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
import logging

from ....models.analysis import PaperAnalysis
from ....services.analysis_service import AnalysisService
from ....core.auth import get_current_user
from ....models.user import User
from ....utils.error_utils import raise_validation_error, raise_not_found, raise_internal_error, ErrorCode

router = APIRouter()
analysis_service = AnalysisService()

logger = logging.getLogger(__name__)


@router.post("/{paper_id}/analyze", response_model=PaperAnalysis, operation_id="analyzePaper")
async def analyze_paper(
    paper_id: str,
    force_refresh: bool = Query(False),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze a paper and generate At-a-Glance summary.
    
    - Generates or refreshes the At-a-Glance analysis immediately.
    - Returns PaperAnalysis (in_depth may be null).
    
    Args:
        paper_id: The ID of the paper to analyze
        force_refresh: If True, bypass cache and regenerate analysis
        current_user: Authenticated user
    
    Returns:
        PaperAnalysis with at_a_glance populated
    """
    try:
        if not paper_id:
            raise_validation_error(
                message="Paper ID is required",
                error_code=ErrorCode.VALIDATION_ERROR
            )
        
        analysis = await analysis_service.analyze_paper(
            paper_id=paper_id,
            force_refresh=force_refresh,
            user_id=current_user.id
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to analyze paper {paper_id}")
        raise_internal_error(
            message=f"Failed to analyze paper: {str(e)}",
            error_code=ErrorCode.INTERNAL_ERROR
        )


@router.get("/{paper_id}", response_model=PaperAnalysis, operation_id="getPaperAnalysis")
async def get_paper_analysis(
    paper_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the latest PaperAnalysis (including cached In-Depth if computed).
    
    Args:
        paper_id: The ID of the paper
        current_user: Authenticated user
    
    Returns:
        PaperAnalysis with all available data
    """
    try:
        if not paper_id:
            raise_validation_error(
                message="Paper ID is required",
                error_code=ErrorCode.VALIDATION_ERROR
            )
        
        analysis = await analysis_service.get_paper_analysis(
            paper_id=paper_id,
            user_id=current_user.id
        )
        
        if not analysis:
            raise_not_found(
                message="Analysis not found for this paper",
                details={"paper_id": paper_id}
            )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to retrieve analysis for paper {paper_id}")
        raise_internal_error(
            message=f"Failed to retrieve analysis: {str(e)}",
            error_code=ErrorCode.INTERNAL_ERROR
        )


@router.post("/{paper_id}/in-depth", response_model=PaperAnalysis, operation_id="computeInDepth")
async def compute_in_depth(
    paper_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Trigger In-Depth Analysis computation for comprehensive understanding of paper sections.
    
    - Generates detailed explanations for all major paper sections
    - Returns PaperAnalysis with in_depth populated
    
    Args:
        paper_id: The ID of the paper
        current_user: Authenticated user
    
    Returns:
        PaperAnalysis with in_depth populated
    """
    try:
        if not paper_id:
            raise_validation_error(
                message="Paper ID is required",
                error_code=ErrorCode.VALIDATION_ERROR
            )
        
        analysis = await analysis_service.compute_in_depth(
            paper_id=paper_id,
            user_id=current_user.id
        )
        
        if not analysis:
            raise_not_found(
                message="Could not compute in-depth analysis for this paper",
                details={"paper_id": paper_id}
            )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to compute in-depth analysis for paper {paper_id}")
        raise_internal_error(
            message=f"Failed to compute in-depth analysis: {str(e)}",
            error_code=ErrorCode.INTERNAL_ERROR
        )
