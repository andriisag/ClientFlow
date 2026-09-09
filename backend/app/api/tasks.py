from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    status: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Task).filter(
        Task.user_id == current_user.id
    )

    if status:
        query = query.filter(Task.status == status)

    return query.offset(offset).limit(limit).all()


@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        due_date=task_data.due_date,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id,
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id,
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    task.title = task_data.title
    task.description = task_data.description
    task.status = task_data.status
    task.due_date = task_data.due_date

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id,
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}