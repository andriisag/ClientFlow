from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientResponse


router = APIRouter(
    prefix="/clients",
    tags=["Clients"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[ClientResponse])
def get_clients(
    search: str | None = None,
    sort: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(Client).where(
        Client.user_id == current_user.id
    )

    if search:
        query = query.where(
            or_(
                Client.name.ilike(f"%{search}%"),
                Client.email.ilike(f"%{search}%"),
                Client.company.ilike(f"%{search}%"),
            )
        )

    if sort == "name":
        query = query.order_by(Client.name)

    elif sort == "company":
        query = query.order_by(Client.company)

    elif sort == "id":
        query = query.order_by(Client.id)

    query = query.limit(limit).offset(offset)

    result = db.execute(query)

    return result.scalars().all()


@router.post("/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_client = Client(
        user_id=current_user.id,
        name=client.name,
        email=client.email,
        phone=client.phone,
        company=client.company,
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    return new_client


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id,
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id,
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    client.name = client_data.name
    client.email = client_data.email
    client.phone = client_data.phone
    client.company = client_data.company

    db.commit()
    db.refresh(client)

    return client


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id,
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    db.delete(client)
    db.commit()

    return {"message": "Client deleted successfully"}

