"""Initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-12-14 18:54:05.436051

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('priority', sa.Enum('high', 'medium', 'low', name='priorityenum'), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('estimated_minutes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
    
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tags_name'), 'tags', ['name'], unique=False)
    op.create_index(op.f('ix_tags_user_id'), 'tags', ['user_id'], unique=False)
    
    # Create task_tags junction table
    op.create_table(
        'task_tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_task_tags_tag_id'), 'task_tags', ['tag_id'], unique=False)
    op.create_index(op.f('ix_task_tags_task_id'), 'task_tags', ['task_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_task_tags_task_id'), table_name='task_tags')
    op.drop_index(op.f('ix_task_tags_tag_id'), table_name='task_tags')
    op.drop_table('task_tags')
    op.drop_index(op.f('ix_tags_user_id'), table_name='tags')
    op.drop_index(op.f('ix_tags_name'), table_name='tags')
    op.drop_table('tags')
    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
    op.drop_table('tasks')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
