from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.client import Client
from app.models.deal import Deal
from app.schemas.dashboard import DashboardStats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    total_clients = db.query(func.count(Client.id)).filter(
        Client.user_id == current_user.id
    ).scalar()

    total_deals = db.query(func.count(Deal.id)).filter(
        Deal.user_id == current_user.id
    ).scalar()

    total_value = db.query(func.coalesce(func.sum(Deal.value), 0)).filter(
        Deal.user_id == current_user.id
    ).scalar()

    recent_deals = (
    db.query(Deal)
    .filter(Deal.user_id == current_user.id)
    .order_by(Deal.id.desc())
    .limit(5)
    .all()
    )

    deals_by_status = {}

    statuses = ["lead", "in_progress", "won", "lost"]

    for status in statuses:
        count = db.query(func.count(Deal.id)).filter(
            Deal.user_id == current_user.id,
            Deal.status == status,
        ).scalar()

        deals_by_status[status] = count

    return {
    "total_clients": total_clients,
    "total_deals": total_deals,
    "total_value": total_value,
    "deals_by_status": deals_by_status,
    "recent_deals": [
        {
            "id": deal.id,
            "title": deal.title,
            "value": deal.value,
            "status": deal.status,
            "client_name": deal.client.name,
        }
        for deal in recent_deals
    ],
}