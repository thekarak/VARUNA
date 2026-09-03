from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["varuna"])


@router.get("/health")
def health_check():
    return {"status": "VARUNA API is running"}