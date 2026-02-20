from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app import deps
from app.models.user import User as UserModel
from app.models.ticket import Ticket as TicketModel
from app.models.comment import Comment

router = APIRouter()

@router.get("/{ticket_id}/comments", response_model=List[dict])
def read_comments(
    ticket_id: int,
    db: Session = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_user)
):
    """
    Retrieve all comments for a specific ticket.
    """
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    comments = db.query(Comment).filter(Comment.ticket_id == ticket_id).order_by(Comment.created_at.asc()).all()
    
    return [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "user_id": c.user_id,
            "user_name": c.user.full_name,
            "is_me": c.user_id == current_user.id
        }
        for c in comments
    ]

@router.post("/{ticket_id}/comments", response_model=dict)
def create_comment(
    ticket_id: int,
    comment_data: dict,  # { "content": "..." }
    db: Session = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_user)
):
    """
    Add a new comment to a ticket.
    """
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    content = comment_data.get("content")
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Comment content cannot be empty")

    new_comment = Comment(
        content=content,
        ticket_id=ticket_id,
        user_id=current_user.id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "created_at": new_comment.created_at,
        "user_id": new_comment.user_id,
        "user_name": current_user.full_name,
        "is_me": True
    }
