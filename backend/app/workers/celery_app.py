import os
from celery import Celery

# Configure Celery with Redis as broker and result backend
celery_app = Celery(
    "varuna",
    broker=os.getenv("REDIS_URL", "redis://redis:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://redis:6379/0")
)

# Load task modules from the workers package
celery_app.autodiscover_tasks(["app.workers"])