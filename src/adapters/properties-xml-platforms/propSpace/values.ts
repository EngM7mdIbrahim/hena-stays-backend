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

const AmenitiesCodes = {
  CentralAirConditioning: 'AC', // Central Air Conditioning
  Balcony: 'BA', // Balcony
  FullyFittedKitchen: 'BK', // Fully Fitted Kitchen
  BuiltInWardrobes: 'BW', // Built-in Wardrobes
  CoveredParking: 'CP', // Covered Parking
  ChildrensPlayArea: 'PR', // Children's Play Area
  Gymnasium: 'SY', // Gymnasium
  PetsAllowed: 'PA', // Pets Allowed
  SharedSwimmingPool: 'SP', // Shared Swimming Pool
  Study: 'ST', // Study
  Sauna: 'SS', // Sauna
  Jacuzzi: 'SS', // Sauna
  PrivateGarage: 'PG', // Private Garage
  PrivateGarden: 'PG', // Private Garden
  BBQArea: 'BR', // BBQ Area
  ViewOfWater: 'VW', // View of Water
  ConciergeService: 'CS', // Concierge Service
  MaidsRoom: 'MR', // Maid's Room
  Restaurants: 'DN', // Restaurants
  Private_Swimming_Pool: 'PP' // Private Swimming Pool
}

const OtherAmenitiesTypes = {
  Balcony: 'Balcony',
  Built_in_Wardrobes: 'Built in wardrobes',
  Central_Air_Conditioning: 'Central air conditioning',
  Fully_Fitted_Kitchen: 'Fully fitted kitchen',
  Fully_Furnished: 'Fully furnished',
  Gymnasium: 'Gymnasium',
  Pets_Allowed: 'Pets allowed',
  Shared_Swimming_Pool: 'Shared swimming pool',
  Children_s_Play_Area: "Children's play area",
  Clubhouse: 'Clubhouse',
  Cycling_Tracks: 'Cycling tracks',
  Golf_Club_and_Clubhouse: 'Golf club and clubhouse',
  Public_Park: 'Public park',
  School: 'School',
  Shopping_Mall: 'Shopping mall',
  Walking_Trails: 'Walking Trails',
  Broadband_Ready: 'Broadband ready',
  Covered_Parking: 'Covered parking',
  Bank_ATM_Facility: 'Bank/ATM Facility',
  Public_Transport: 'Public transport',
  Jacuzzi: 'Jacuzzi',
  Laundry_Washing_Room: 'Laundry/washing room',
  Maids_Room: "Maid's room",
  Private_Garage: 'Private garage',
  Private_Garden: 'Private garden',
  Sauna: 'Sauna',
  Storage_Room: 'Storage room',
  Maintenance_24_Hours: '24 hours Maintenance',
  Basketball_Court: 'Basketball Court',
  Beach_Access: 'Beach Access',
  Children_s_Nursery: "Children's nursery",
  Fitness_Center: 'Fitness Center',
  Mosque: 'Mosque',
  Recreational_Facilities: 'Recreational Facilities',
  Restaurants: 'Restaurants',
  Shops: 'Shops',
  Squash_Courts: 'Squash courts',
  Tennis_Courts: 'Tennis courts',
  BBQ_Area: 'BBQ area',
  Landscaped_Garden: 'Landscaped Garden',
  Private_Swimming_Pool: 'Private swimming pool',
  Study: 'Study',
  Bus_Services: 'Bus services',
  Communal_Gardens: 'Communal gardens',
  Drivers_Room: "Driver's Room",
  Kitchen_White_Goods: 'Kitchen white goods',
  Marble_Floors: 'Marble floors',
  Satellite_Cable_TV: 'Satellite/Cable TV',
  Solid_Wood_Floors: 'Solid wood floors',
  View_of_Gardens: 'View of gardens',
  View_of_Sea_Water: 'View of sea/water',
  Concierge_Service: 'Concierge service',
  Community_View: 'Community View',
  Basement_Parking: 'Basement parking',
  Intercom: 'Intercom',
  Business_Center: 'Business Center',
  Gazebo_and_Outdoor_Entertaining_Area: 'Gazebo and outdoor entertaining area',
  Laundry_Service: 'Laundry Service',
  Carpets: 'Carpets',
  Marina_Berth: 'Marina Berth',
  Sports_Academies: 'Sports academies',
  On_Mid_Floor: 'On mid floor',
  Metro_Station: 'Metro station',
  Public_Parking: 'Public parking',
  Polo_Club_and_Clubhouse: 'Polo club and clubhouse',
  Upgraded_Interior: 'Upgraded interior',
  On_High_Floor: 'On high floor',
  View_of_Golf_Course: 'View of golf course',
  On_Low_Floor: 'On low floor'
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
  AmenitiesCodes,
  OtherAmenitiesTypes,
  RentalPeriodTypes
}
