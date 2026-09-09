from pydantic import BaseModel


class RecentDeal(BaseModel):
    id: int
    title: str
    value: int | None = None
    status: str
    client_name: str


class DashboardStats(BaseModel):
    total_clients: int
    total_deals: int
    total_value: int
    deals_by_status: dict[str, int]
    recent_deals: list[RecentDeal]