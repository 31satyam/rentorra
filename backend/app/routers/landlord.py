from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Property, Inquiry
from app.schemas import InquiryReplyRequest, PropertyResponse, InquiryResponse
from app.core.dependencies import require_role

router = APIRouter(prefix="/landlord", tags=["Landlord"])

@router.get("/my-properties", response_model=List[PropertyResponse])
def get_my_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
    return properties

@router.get("/my-inquiries", response_model=List[InquiryResponse])
def get_my_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    # Get all inquiries for landlord's properties
    inquiries = db.query(Inquiry).join(Property).filter(
        Property.owner_id == current_user.id
    ).all()
    return inquiries

@router.post("/inquiries/{inquiry_id}/reply")
def reply_to_inquiry(
    inquiry_id: int,
    data: InquiryReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    inquiry = db.query(Inquiry).join(Property).filter(
        Inquiry.id == inquiry_id,
        Property.owner_id == current_user.id
    ).first()

    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    inquiry.reply = data.reply
    db.commit()

    return {"message": "Reply sent successfully"}