from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, teams, tickets

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
