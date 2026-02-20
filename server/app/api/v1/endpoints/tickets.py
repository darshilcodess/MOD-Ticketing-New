from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.ticket import Ticket, TicketCreate, TicketUpdate, TicketAllocate, TicketResolve 
from app.models.ticket import Ticket as TicketModel, TicketStatus
from app.models.user import User as UserModel, UserRole

router = APIRouter()

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
    
    # Check permissions
    if current_user.role == UserRole.UNIT and ticket.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if current_user.role == UserRole.TEAM and ticket.assigned_team_id != current_user.team_id:
        # Assuming team members can only see tickets assigned to their team? 
        # Or maybe they can see all? Strict for now.
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
