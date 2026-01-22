import uuid
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.task import Task, TaskStatus, TaskResponse
from app.models.user import User
from app.models.paper import Paper
from app.services.paper_service import PaperService
from app.services.langchain_service import LangChainService
from app.db.database import SessionLocal
from app.utils.file_utils import cleanup_uploaded_pdfs
import logging

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self):
        self.paper_service = PaperService()
        self.langchain_service = LangChainService()
        self._running_tasks: Dict[str, asyncio.Task] = {}

    async def create_task(
        self,
        db: Session,
        user: User
    ) -> Task:
        """Create a new task and return it"""
        task_id = str(uuid.uuid4())
        
        task = Task(
            id=task_id,
            user_id=user.id,
            status=TaskStatus.PENDING
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        return task

    async def start_review_generation_task(
        self,
        task_id: str,
        paper_ids: list[str],
        topic: str,
        max_papers: int = 10
    ) -> None:
        """Start a review generation task in the background"""
        # Create a background task
        background_task = asyncio.create_task(
            self._execute_review_generation(task_id, paper_ids, topic, max_papers)
        )
        
        # Store the task reference
        self._running_tasks[task_id] = background_task
        
        # Set up cleanup when task completes
        background_task.add_done_callback(
            lambda t: self._running_tasks.pop(task_id, None)
        )

    async def _execute_review_generation(
        self,
        task_id: str,
        paper_ids: list[str],
        topic: str,
        max_papers: int
    ) -> None:
        """Execute the review generation task"""
        db = SessionLocal()
        
        try:
            # Get the task
            task = db.query(Task).filter(Task.id == task_id).first()
            if not task:
                logger.error(f"Task {task_id} not found")
                return

            # Update task status to running
            task.status = TaskStatus.RUNNING
            db.commit()

            # Separate arXiv IDs from uploaded paper IDs
            arxiv_ids = [pid for pid in paper_ids if not pid.startswith('upload_')]
            uploaded_ids = [pid for pid in paper_ids if pid.startswith('upload_')]

            papers = []
            
            # Fetch arXiv papers
            if arxiv_ids:
                arxiv_papers = await self.paper_service.get_papers_by_ids(arxiv_ids)
                papers.extend(arxiv_papers)

            # Fetch uploaded papers
            if uploaded_ids:
                uploaded_papers = await self.paper_service.get_uploaded_papers(uploaded_ids)
                papers.extend(uploaded_papers)

            if not papers:
                raise ValueError("No papers found for the given IDs")

            # Limit papers if necessary
            if len(papers) > max_papers:
                papers = papers[:max_papers]

            review_text = await self.langchain_service.generate_review(papers, topic)

            # Complete task
            task.status = TaskStatus.COMPLETED
            
            # Store the result with proper datetime serialization
            citations_data = []
            for paper in papers:
                paper_dict = paper.model_dump()
                # Convert datetime to ISO string for JSON serialization
                if 'published' in paper_dict and isinstance(paper_dict['published'], datetime):
                    paper_dict['published'] = paper_dict['published'].isoformat()
                citations_data.append(paper_dict)
            
            result_data = {
                "review": review_text,
                "citations": citations_data,
                "topic": topic
            }
            task.set_result_data(result_data)
            
            db.commit()
            
            logger.info(f"Review generation task {task_id} completed successfully")

        except Exception as e:
            logger.error(f"Review generation task {task_id} failed: {str(e)}")
            
            # Update task with error
            try:
                task = db.query(Task).filter(Task.id == task_id).first()
                if task:
                    task.status = TaskStatus.FAILED
                    task.error_message = str(e)
                    db.commit()
            except Exception as commit_error:
                logger.error(f"Failed to update task {task_id} with error: {commit_error}")
                
        finally:
            # Clean up uploaded PDFs after review generation (success or failure)
            await cleanup_uploaded_pdfs(paper_ids)
            db.close()

    async def get_task_status(self, db: Session, task_id: str, user: User) -> Optional[Task]:
        """Get task status for a specific user"""
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user.id
        ).first()
        
        return task

    async def get_user_tasks(
        self,
        db: Session,
        user: User,
        status: Optional[TaskStatus] = None,
        limit: int = 50
    ) -> list[Task]:
        """Get tasks for a user with optional filtering"""
        query = db.query(Task).filter(Task.user_id == user.id)
        
        if status:
            query = query.filter(Task.status == status)
        
        return query.order_by(Task.created_at.desc()).limit(limit).all()

    async def cancel_task(self, db: Session, task_id: str, user: User) -> bool:
        """Cancel a running task"""
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user.id
        ).first()
        
        if not task:
            return False
        
        if task.status not in [TaskStatus.PENDING, TaskStatus.RUNNING]:
            return False
        
        # Cancel the background task if it's running
        if task_id in self._running_tasks:
            background_task = self._running_tasks[task_id]
            background_task.cancel()
            self._running_tasks.pop(task_id, None)
        
        # Update task status
        task.status = TaskStatus.FAILED
        task.error_message = "Task cancelled by user"
        db.commit()
        
        return True

    def to_response(self, task: Task) -> TaskResponse:
        """Convert Task model to TaskResponse"""
        return TaskResponse(
            id=task.id,
            status=task.status,
            error_message=task.error_message,
            created_at=task.created_at,
            result_data=task.get_result_data()
        )
