from enum import Enum

from pydantic import BaseModel


class DealStatus(str, Enum):
    LEAD = "lead"
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"


class DealBase(BaseModel):
    title: str
    value: int | None = None
    status: DealStatus = DealStatus.LEAD
    client_id: int


class DealCreate(DealBase):
    pass


class DealResponse(DealBase):
    id: int
    user_id: int
    client_name: str

    class Config:
        from_attributes = True