from typing import List, Optional, Literal
from pydantic import BaseModel
from datetime import datetime


class PaperMetadata(BaseModel):
    paper_id: str
    title: str
    authors: List[str]
    year: Optional[int] = None
    url: Optional[str] = None
    source: Literal["upload", "arxiv", "url"] = "upload"


class AtAGlanceAnalysis(BaseModel):
    # Basic Information
    title: str
    authors: List[str]
    affiliations: List[str]
    
    # Abstract & Keywords
    abstract: str
    keywords: List[str]
    
    # Paper Sections (in order)
    introduction: str                # Key points from introduction
    related_work: str                # Summary of related work/background
    problem_statement: str           # Core research questions/problems addressed
    methodology: str                 # 2–4 sentences in plain English
    results: str                     # Key findings and experimental outcomes
    discussion: str                  # Analysis and interpretation of results
    limitations: List[str]           # Acknowledged limitations
    future_work: List[str]           # Proposed future research directions
    conclusion: str                  # Main conclusions


class InDepthAnalysis(BaseModel):
    """Comprehensive, detailed analysis of each paper section."""
    introduction: str               # In-depth explanation of introduction
    related_work: str              # Comprehensive review of related work
    problem_statement: str         # Detailed problem formulation and research questions
    methodology: str               # Thorough explanation of methodology
    results: str                   # Comprehensive analysis of results
    discussion: str                # In-depth discussion and interpretation
    limitations: str               # Detailed limitations analysis
    conclusion_future_work: str    # Comprehensive conclusion and future directions


class PaperAnalysis(BaseModel):
    paper: PaperMetadata
    at_a_glance: AtAGlanceAnalysis
    in_depth: Optional[InDepthAnalysis] = None          # lazy-loaded comprehensive analysis
    generated_at: datetime
    schema_version: str = "1.0.0"
    model_tag: str = "gemini-2.0-flash"                 # env-configurable
