"""add user_id to clients

Revision ID: 740ed468a300
Revises: c4643c2cab4a
Create Date: 2026-09-06 12:59:08.768622

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "740ed468a300"
down_revision: Union[str, None] = "c4643c2cab4a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "clients",
        sa.Column("user_id", sa.Integer(), nullable=True),
    )

    op.create_index(
        op.f("ix_clients_user_id"),
        "clients",
        ["user_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_clients_user_id_users",
        "clients",
        "users",
        ["user_id"],
        ["id"],
    )

    op.execute(
        "UPDATE clients SET user_id = 1 WHERE user_id IS NULL"
    )

    op.alter_column(
        "clients",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_clients_user_id_users",
        "clients",
        type_="foreignkey",
    )

    op.drop_index(
        op.f("ix_clients_user_id"),
        table_name="clients",
    )

    op.drop_column("clients", "user_id")