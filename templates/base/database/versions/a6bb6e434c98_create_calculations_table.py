"""create calculations table

Revision ID: a6bb6e434c98
Revises: 
Create Date: 2026-08-21 23:59:25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a6bb6e434c98'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'calculations',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('input_number', sa.Float, nullable=False),
        sa.Column('result', sa.Float, nullable=False),
    )


def downgrade() -> None:
    op.drop_table('calculations')
