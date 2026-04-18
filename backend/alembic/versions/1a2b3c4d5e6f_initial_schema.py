"""initial schema

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2026-03-30 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This acts as the baseline migration!
    # Instead of running all create_table commands, we pass since Base.metadata.create_all is currently being used,
    # or you can run `alembic revision --autogenerate` later when you have DB access.
    # To fully initialize database tables in production, auto-generate this properly against a clean database.
    pass


def downgrade() -> None:
    pass
