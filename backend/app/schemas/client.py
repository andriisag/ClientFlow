from pydantic import BaseModel


class ClientBase(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientResponse(ClientBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True