const OfferType = {
  ResidentialSale: 'RS',
  ResidentialRent: 'RR',
  CommercialSale: 'CS',
  CommercialRent: 'CR'
}

const CompletionStatus = {
  Completed: 'completed',
  OffPlan: 'off_plan',
  CompletedPrimary: 'completed_primary',
  OffPlanPrimary: 'off_plan_primary'
}

const FurnishedStatus = {
  Yes: 'Yes',
  No: 'No',
  Partially: 'Partly'
}

const PropertyTypes = {
  Apartment: 'AP',
  Flat: 'AP',
  BulkUnits: 'BU',
  Bungalow: 'BW',
  Compound: 'CD',
  Duplex: 'DX',
  Factory: 'FA',
  Farm: 'FM',
  FullFloor: 'FF',
  HotelApartment: 'HA',
  HalfFloor: 'HF',
  LaborCamp: 'LC',
  LandPlot: 'LP',
  OfficeSpace: 'OF',
  BusinessCentre: 'BC',
  Penthouse: 'PH',
  Storage: 'ST',
  Retail: 'RE',
  Townhouse: 'TH',
  Restaurant: 'RT',
  Villa: 'VH',
  House: 'VH',
  StaffAccommodation: 'SA',
  WholeBuilding: 'WB',
  Shop: 'SH',
  Warehouse: 'WH',
  Showroom: 'SR',
  CoWorkingSpace: 'CW'
}

const AmenitiesTypes = {
  CentralACHeating: 'AC',
  Balcony: 'BA',
  BuiltInKitchenAppliances: 'BK',
  ViewOfLandmark: 'BL',
  BuiltInWardrobes: 'BW',
  CoveredParking: 'CP',
  ConciergeService: 'CS',
  LobbyInBuilding: 'LB',
  MaidRoom: 'MR',
  MaidService: 'MS',
  PetsAllowed: 'PA',
  PrivateGarden: 'PG',
  PrivateJacuzzi: 'PJ',
  PrivatePool: 'PP',
  PrivateGym: 'PY',
  VastuCompliant: 'VC',
  Security: 'SE',
  SharedPool: 'SP',
  SharedSpa: 'SS',
  Study: 'ST',
  SharedGym: 'SY',
  ViewOfWater: 'VW',
  WalkInCloset: 'WC',
  ChildrenPool: 'CO',
  ChildrenPlayArea: 'PR',
  BarbecueArea: 'BR',
  ConferenceRoom: 'CR',
  AvailableNetworked: 'AN',
  Pantry: 'PN',
  Mezzanine: 'MZ',
  DiningInBuilding: 'DN',
  Internet: 'AN',
  ChildrensPool: 'CO',
  ChildrensPlayArea: 'PR',
  MaintenanceStaff: 'MS'
}

const OtherAmenitiesTypes = {
  CentralA_C_Heating: 'Central A/C & Heating',
  Balcony: 'Balcony',
  Built_in_Kitchen_Appliances: 'Built-in Kitchen Appliances',
  View_of_Landmark: 'View of Landmark',
  Built_in_Wardrobes: 'Built-in Wardrobes',
  Covered_Parking: 'Covered Parking',
  Concierge_Service: 'Concierge Service',
  Lobby_in_Building: 'Lobby in Building',
  Maid_s_Room: "Maid's Room",
  Maid_Service: 'Maid Service',
  Pets_Allowed: 'Pets Allowed',
  Private_Garden: 'Private Garden',
  Private_Jacuzzi: 'Private Jacuzzi',
  Private_Pool: 'Private Pool',
  Private_Gym: 'Private Gym',
  Vastu_compliant: 'Vastu-compliant',
  Security: 'Security',
  Shared_Pool: 'Shared Pool',
  Shared_Spa: 'Shared Spa',
  Study: 'Study',
  Shared_Gym: 'Shared Gym',
  View_of_Water: 'View of Water',
  Walk_in_Closet: 'Walk-in Closet',
  Children_s_Pool: "Children's Pool",
  Children_s_Play_Area: "Children's Play Area",
  Barbecue_Area: 'Barbecue Area',
  Conference_Room: 'Conference Room',
  Available_Networked: 'Available Networked',
  Pantry: 'Pantry',
  Mezzanine: 'Mezzanine',
  Dining_in_building: 'Dining in building'
}

const RentalPeriodTypes = {
  Yearly: 'Y',
  Monthly: 'M',
  Weekly: 'W',
  Daily: 'D'
}

export const XmlValues = {
  OfferType,
  CompletionStatus,
  FurnishedStatus,
  PropertyTypes,
  AmenitiesTypes,
  OtherAmenitiesTypes,
  RentalPeriodTypes
}
