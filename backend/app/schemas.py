from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "tenant"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Property Schemas
class PropertyImageBase(BaseModel):
    image_url: str

class PropertyImageResponse(PropertyImageBase):
    id: int
    property_id: int
    
    class Config:
        from_attributes = True

class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    rent_amount: float
    deposit_amount: Optional[float] = None
    address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[float] = None
    property_type: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyResponse(PropertyBase):
    id: int
    owner_id: int
    created_at: datetime
    images: List[PropertyImageResponse] = []
    
    class Config:
        from_attributes = True

# Inquiry Schemas
class InquiryBase(BaseModel):
    property_id: int
    message: Optional[str] = None

class InquiryCreate(InquiryBase):
    pass

class InquiryResponse(BaseModel):
    id: int
    property_id: int
    tenant_id: int
    message: str
    reply: Optional[str]  
    created_at: datetime

    class Config:
        from_attributes = True

class InquiryReplyRequest(BaseModel):
    reply: str

# Wishlist Schemas
class WishlistBase(BaseModel):
    property_id: int

class WishlistCreate(WishlistBase):
    pass

class WishlistResponse(WishlistBase):
    id: int
    tenant_id: int
    
    class Config:
        from_attributes = True