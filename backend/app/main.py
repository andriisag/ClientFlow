from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.clients import router as clients_router
from app.api.auth import router as auth_router
from app.api.deals import router as deals_router
from app.api.dashboard import router as dashboard_router
from app.api.tasks import router as tasks_router
from app.db.database import engine, get_db

app = FastAPI(
    title="ClientFlow API",
    description="CRM SaaS backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://clientflow-2lmz.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients_router)
app.include_router(auth_router)
app.include_router(deals_router)
app.include_router(dashboard_router)
app.include_router(tasks_router)


@app.get("/")
def root():
    return {"message": "ClientFlow API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def database_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}

@app.get("/db-session")
def database_session(db: Session = Depends(get_db)):
    return {"session": "ok"}

