from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.client import Client
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealResponse


router = APIRouter(
    prefix="/deals",
    tags=["Deals"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[DealResponse])
def get_deals(
    status: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Deal).filter(
        Deal.user_id == current_user.id
    )

    if status:
        query = query.filter(Deal.status == status)

    deals = query.offset(offset).limit(limit).all()

    return [
    {
        "id": deal.id,
        "user_id": deal.user_id,
        "title": deal.title,
        "value": deal.value,
        "status": deal.status,
        "client_id": deal.client_id,
        "client_name": deal.client.name,
    }
    for deal in deals
    ]


@router.post("/", response_model=DealResponse)
def create_deal(
    deal_data: DealCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client = db.query(Client).filter(
        Client.id == deal_data.client_id,
        Client.user_id == current_user.id,
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    new_deal = Deal(
        user_id=current_user.id,
        client_id=deal_data.client_id,
        title=deal_data.title,
        value=deal_data.value,
        status=deal_data.status,
    )

    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)

    return {
    "id": new_deal.id,
    "user_id": new_deal.user_id,
    "title": new_deal.title,
    "value": new_deal.value,
    "status": new_deal.status,
    "client_id": new_deal.client_id,
    "client_name": client.name,
    }   

@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.user_id == current_user.id,
    ).first()

    if deal is None:
        raise HTTPException(
            status_code=404,
            detail="Deal not found",
        )

    return {
    "id": deal.id,
    "user_id": deal.user_id,
    "title": deal.title,
    "value": deal.value,
    "status": deal.status,
    "client_id": deal.client_id,
    "client_name": deal.client.name,
    }


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    deal_data: DealCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.user_id == current_user.id,
    ).first()

    if deal is None:
        raise HTTPException(
            status_code=404,
            detail="Deal not found",
        )

    client = db.query(Client).filter(
        Client.id == deal_data.client_id,
        Client.user_id == current_user.id,
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    deal.client_id = deal_data.client_id
    deal.title = deal_data.title
    deal.value = deal_data.value
    deal.status = deal_data.status

    db.commit()
    db.refresh(deal)

    return {
    "id": deal.id,
    "user_id": deal.user_id,
    "title": deal.title,
    "value": deal.value,
    "status": deal.status,
    "client_id": deal.client_id,
    "client_name": deal.client.name,
    }  


@router.delete("/{deal_id}")
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.user_id == current_user.id,
    ).first()

    if deal is None:
        raise HTTPException(
            status_code=404,
            detail="Deal not found",
        )

    db.delete(deal)
    db.commit()

    return {"message": "Deal deleted successfully"}