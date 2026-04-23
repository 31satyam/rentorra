from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Property, Inquiry, Wishlist
from app.schemas import InquiryCreate, InquiryResponse, WishlistCreate, WishlistResponse, PropertyResponse
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/tenant", tags=["Tenant"])

@router.post("/inquiries", response_model=InquiryResponse)
def create_inquiry(
    inquiry_data: InquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if property exists
    property = db.query(Property).filter(Property.id == inquiry_data.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    existing_inquiry = db.query(Inquiry).filter(
        Inquiry.property_id == inquiry_data.property_id,
        Inquiry.tenant_id == current_user.id
    ).first()

    if existing_inquiry:
        existing_inquiry.message += f"\n\nNew Message: {inquiry_data.message}"
        db.commit()
        db.refresh(existing_inquiry)
        return existing_inquiry
    
    new_inquiry = Inquiry(
        **inquiry_data.model_dump(),
        tenant_id=current_user.id
    )
    
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    
    return new_inquiry

@router.get("/my-inquiries", response_model=List[InquiryResponse])
def get_my_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    inquiries = db.query(Inquiry).filter(
        Inquiry.tenant_id == current_user.id
    ).all()
    
    return inquiries

@router.post("/wishlist", response_model=WishlistResponse)
def add_to_wishlist(
    wishlist_data: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if already in wishlist
    existing = db.query(Wishlist).filter(
        Wishlist.tenant_id == current_user.id,
        Wishlist.property_id == wishlist_data.property_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Property already in wishlist")
    
    new_wishlist = Wishlist(
        tenant_id=current_user.id,
        property_id=wishlist_data.property_id
    )
    
    db.add(new_wishlist)
    db.commit()
    db.refresh(new_wishlist)
    
    return new_wishlist

@router.get("/wishlist", response_model=List[PropertyResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    wishlist_items = db.query(Wishlist).filter(Wishlist.tenant_id == current_user.id).all()
    properties = [item.property for item in wishlist_items]
    return properties

@router.delete("/wishlist/{property_id}")
def remove_from_wishlist(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    wishlist_item = db.query(Wishlist).filter(
        Wishlist.tenant_id == current_user.id,
        Wishlist.property_id == property_id
    ).first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    
    db.delete(wishlist_item)
    db.commit()
    
    return {"message": "Removed from wishlist"}

@router.get("/nearby", response_model=List[PropertyResponse])
def get_nearby_properties(
    lat: float,
    lng: float,
    radius: float = 5,  # radius in kilometers
    db: Session = Depends(get_db)
):
    """Get properties within a radius of given coordinates"""
    # Simple bounding box filter (for MVP)
    # For production, use PostGIS or proper geolocation queries
    properties = db.query(Property).filter(
        Property.latitude.between(lat - 0.05, lat + 0.05),
        Property.longitude.between(lng - 0.05, lng + 0.05)
    ).all()
    return properties