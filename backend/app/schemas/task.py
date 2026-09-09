from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    due_date: datetime | None = None


class TaskCreate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True