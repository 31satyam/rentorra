export type AuthStackParamList = {
  RoleSelection: undefined;
  Login: { role: 'tenant' | 'landlord' };
  Register: { role?: 'tenant' | 'landlord' };
};

export type TenantStackParamList = {
  Home: undefined;
  PropertyDetail: { propertyId: number };
  Wishlist: undefined;
  Inquiries: undefined;
  Profile: undefined;
};

export type LandlordStackParamList = {
  Dashboard: undefined;
  AddProperty: undefined;
  EditProperty: { propertyId: number };
  PropertyDetail: { propertyId: number };
  Inquiries: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Tenant: undefined;
  Landlord: undefined;
};