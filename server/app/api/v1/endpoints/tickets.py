from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import deps
from app.schemas.ticket import Ticket, TicketCreate, TicketUpdate, TicketAllocate, TicketResolve 
from app.models.ticket import Ticket as TicketModel, TicketStatus
from app.models.user import User as UserModel, UserRole
from app.models.notification import Notification

router = APIRouter()

# ... (read_tickets remains unchanged)

@router.get("/", response_model=List[Ticket])
def read_tickets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve tickets based on user role.
    """
    query = db.query(TicketModel)

    if current_user.role == UserRole.UNIT:
        # Unit users only see tickets they created
        query = query.filter(TicketModel.created_by_id == current_user.id)
    elif current_user.role == UserRole.TEAM:
        # Team users see tickets assigned to their team
        if not current_user.team_id:
             return [] # Or raise error
        query = query.filter(TicketModel.assigned_team_id == current_user.team_id)
        # Maybe also show resolved by me?
    elif current_user.role == UserRole.G1:
        # G1 sees all tickets. Can filter by status.
        pass
    
    if status:
        query = query.filter(TicketModel.status == status)
    
    tickets = query.offset(skip).limit(limit).all()
    return tickets

@router.post("/", response_model=Ticket)
def create_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_in: TicketCreate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new ticket. Only UNIT users or G1 should technically do this.
    """
    ticket = TicketModel(
        title=ticket_in.title,
        description=ticket_in.description,
        priority=ticket_in.priority,
        created_by_id=current_user.id,
        status=TicketStatus.OPEN
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Notify G1 users
    g1_users = db.query(UserModel).filter(UserModel.role == UserRole.G1).all()
    for g1 in g1_users:
        notification = Notification(
            recipient_id=g1.id,
            ticket_id=ticket.id,
            message=f"New ticket created by {current_user.full_name}: {ticket.title}"
        )
        db.add(notification)
    
    db.commit()
    
    return ticket

@router.get("/{ticket_id}", response_model=Ticket)
def read_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_id: int,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get ticket by ID.
    """
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Check permissions logic (simplified for brevity, assume same as before)
    if current_user.role == UserRole.UNIT and ticket.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if current_user.role == UserRole.TEAM and ticket.assigned_team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return ticket

@router.patch("/{ticket_id}/allocate", response_model=Ticket)
def allocate_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_id: int,
    allocation: TicketAllocate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Allocate ticket to a team (G1 only).
    """
    if current_user.role != UserRole.G1 and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket.assigned_team_id = allocation.team_id
    if allocation.priority:
        ticket.priority = allocation.priority
    ticket.status = TicketStatus.ALLOCATED
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Notify Team members
    team_members = db.query(UserModel).filter(UserModel.team_id == allocation.team_id).all()
    for member in team_members:
        notification = Notification(
            recipient_id=member.id,
            ticket_id=ticket.id,
            message=f"Ticket allocated to your team: {ticket.title}"
        )
        db.add(notification)
        
    # Notify Unit (Creator)
    if ticket.created_by_id:
        notification_unit = Notification(
            recipient_id=ticket.created_by_id,
            ticket_id=ticket.id,
            message=f"Your ticket '{ticket.title}' has been allocated to a team."
        )
        db.add(notification_unit)
        
    db.commit()
    
    return ticket

@router.patch("/{ticket_id}/resolve", response_model=Ticket)
def resolve_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_id: int,
    resolution: TicketResolve,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Resolve ticket (Team Member only).
    """
    if current_user.role != UserRole.TEAM and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.assigned_team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Ticket not assigned to your team")

    ticket.resolution_notes = resolution.resolution_notes
    ticket.resolved_by_id = current_user.id
    ticket.status = TicketStatus.RESOLVED
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Notify G1
    g1_users = db.query(UserModel).filter(UserModel.role == UserRole.G1).all()
    for g1 in g1_users:
        notification = Notification(
            recipient_id=g1.id,
            ticket_id=ticket.id,
            message=f"Ticket resolved by {current_user.full_name}: {ticket.title}"
        )
        db.add(notification)
        
    # Notify Unit (Creator)
    if ticket.created_by_id:
        notification_unit = Notification(
            recipient_id=ticket.created_by_id,
            ticket_id=ticket.id,
            message=f"Your ticket '{ticket.title}' has been resolved."
        )
        db.add(notification_unit)
        
    db.commit()

    return ticket

@router.patch("/{ticket_id}/close", response_model=Ticket)
def close_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_id: int,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Close ticket (Unit User only, confirming resolution).
    """
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if current_user.role != UserRole.UNIT and current_user.role != UserRole.ADMIN:
         raise HTTPException(status_code=403, detail="Not enough permissions")

    if ticket.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    ticket.status = TicketStatus.CLOSED
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
