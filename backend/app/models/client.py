from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    company: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    deals: Mapped[list["Deal"]] = relationship(
    back_populates="client"
    )