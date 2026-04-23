from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import cloudinary
import cloudinary.uploader
import os
from uuid import uuid4
from fastapi import UploadFile

from app.database import get_db
from app.models import Property, PropertyImage, User
from app.schemas import PropertyCreate, PropertyResponse
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/properties", tags=["Properties"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

UPLOAD_DIR = "uploads/properties"

# create folder if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Public endpoints (for tenants)
@router.get("/", response_model=List[PropertyResponse])
def list_properties(
    skip: int = 0,
    limit: int = 10,
    city: str = None,
    min_rent: float = None,
    max_rent: float = None,
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if min_rent:
        query = query.filter(Property.rent_amount >= min_rent)
    if max_rent:
        query = query.filter(Property.rent_amount <= max_rent)
    
    properties = query.offset(skip).limit(limit).all()
    return properties

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

# Landlord only endpoints
@router.post("/", response_model=PropertyResponse)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    new_property = Property(
        **property_data.model_dump(),
        owner_id=current_user.id
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return new_property

@router.post("/{property_id}/images")
async def upload_property_images(
    property_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    # Verify property ownership
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    image_urls = []

    for file in files:
        # ✅ Generate unique filename
        file_ext = file.filename.split(".")[-1]
        filename = f"{uuid4().hex}.{file_ext}"

        file_path = os.path.join(UPLOAD_DIR, filename)

        # ✅ Save file locally
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # ✅ Create accessible URL
        image_url = f"/{UPLOAD_DIR}/{filename}"

        # Save to DB
        property_image = PropertyImage(
            property_id=property_id,
            image_url=image_url
        )
        db.add(property_image)

        image_urls.append(image_url)

    db.commit()

    return {
        "message": "Images uploaded successfully",
        "urls": image_urls
    }

@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    for key, value in property_data.model_dump().items():
        setattr(property, key, value)
    
    db.commit()
    db.refresh(property)
    
    return property

@router.delete("/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord"))
):
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    from app.models import Inquiry, Wishlist
    
    # Delete dependent records first to avoid foreign key constraint failures
    db.query(PropertyImage).filter(PropertyImage.property_id == property_id).delete()
    db.query(Inquiry).filter(Inquiry.property_id == property_id).delete()
    db.query(Wishlist).filter(Wishlist.property_id == property_id).delete()
    
    db.delete(property)
    db.commit()
    
    return {"message": "Property deleted successfully"}