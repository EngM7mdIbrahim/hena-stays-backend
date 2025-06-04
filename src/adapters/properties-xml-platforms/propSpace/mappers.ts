import {
  AmenitiesCodes,
  CategoriesCodes,
  CompletionEnum,
  FurnishedEnum,
  RentDurationEnum,
  SaleTypeEnum,
  SubCategoriesCodes
} from '@commonTypes'

import { XmlValues } from './values'

const OfferTypeMapper = {
  [XmlValues.OfferType.ResidentialSale]: SaleTypeEnum.Sale,
  [XmlValues.OfferType.ResidentialRent]: SaleTypeEnum.Rent,
  [XmlValues.OfferType.CommercialSale]: SaleTypeEnum.Sale,
  [XmlValues.OfferType.CommercialRent]: SaleTypeEnum.Rent
}

const ResidentialSubCategoryMapper = {
  [XmlValues.PropertyTypes.Apartment]: SubCategoriesCodes.Apartment,
  [XmlValues.PropertyTypes.Flat]: SubCategoriesCodes.Apartment,
  [XmlValues.PropertyTypes.BulkUnits]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Bungalow]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Compound]: SubCategoriesCodes.VillaCompound,
  [XmlValues.PropertyTypes.Duplex]: SubCategoriesCodes.Duplex,
  [XmlValues.PropertyTypes.Factory]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Farm]: 'FM',
  [XmlValues.PropertyTypes.FullFloor]: SubCategoriesCodes.Floor,
  [XmlValues.PropertyTypes.HotelApartment]: SubCategoriesCodes.HotelApartment,
  [XmlValues.PropertyTypes.HalfFloor]: SubCategoriesCodes.Floor,
  [XmlValues.PropertyTypes.LaborCamp]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.LandPlot]: SubCategoriesCodes.Plot,
  [XmlValues.PropertyTypes.OfficeSpace]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.BusinessCentre]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Penthouse]: SubCategoriesCodes.Penthouse,
  [XmlValues.PropertyTypes.Storage]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Retail]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Townhouse]: SubCategoriesCodes.Villa,
  [XmlValues.PropertyTypes.Restaurant]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Villa]: SubCategoriesCodes.Villa,
  [XmlValues.PropertyTypes.House]: SubCategoriesCodes.Villa,
  [XmlValues.PropertyTypes.StaffAccommodation]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.WholeBuilding]: SubCategoriesCodes.Building,
  [XmlValues.PropertyTypes.Shop]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Warehouse]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Showroom]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.CoWorkingSpace]: SubCategoriesCodes.Other
}

const CommercialSubCategoryMapper = {
  [XmlValues.PropertyTypes.Apartment]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Flat]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.BulkUnits]: SubCategoriesCodes.BulkUnit,
  [XmlValues.PropertyTypes.Bungalow]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Compound]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Duplex]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Factory]: SubCategoriesCodes.IndustrialLand,
  [XmlValues.PropertyTypes.Farm]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.FullFloor]: SubCategoriesCodes.Floor,
  [XmlValues.PropertyTypes.HotelApartment]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.HalfFloor]: SubCategoriesCodes.Floor,
  [XmlValues.PropertyTypes.LaborCamp]: SubCategoriesCodes.LabourCamp,
  [XmlValues.PropertyTypes.LandPlot]: SubCategoriesCodes.Plot,
  [XmlValues.PropertyTypes.OfficeSpace]: SubCategoriesCodes.Office,
  [XmlValues.PropertyTypes.BusinessCentre]: SubCategoriesCodes.Building,
  [XmlValues.PropertyTypes.Penthouse]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Storage]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Retail]: SubCategoriesCodes.Shop,
  [XmlValues.PropertyTypes.Townhouse]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Restaurant]: SubCategoriesCodes.Shop,
  [XmlValues.PropertyTypes.Villa]: SubCategoriesCodes.Villa,
  [XmlValues.PropertyTypes.House]: SubCategoriesCodes.Villa,
  [XmlValues.PropertyTypes.StaffAccommodation]: SubCategoriesCodes.LabourCamp,
  [XmlValues.PropertyTypes.WholeBuilding]: SubCategoriesCodes.Building,
  [XmlValues.PropertyTypes.Shop]: SubCategoriesCodes.Shop,
  [XmlValues.PropertyTypes.Warehouse]: SubCategoriesCodes.Other,
  [XmlValues.PropertyTypes.Showroom]: SubCategoriesCodes.Showroom,
  [XmlValues.PropertyTypes.CoWorkingSpace]: SubCategoriesCodes.Building
}
const SubCategoryMapper = {
  [XmlValues.OfferType.ResidentialSale]: ResidentialSubCategoryMapper,
  [XmlValues.OfferType.ResidentialRent]: ResidentialSubCategoryMapper,
  [XmlValues.OfferType.CommercialSale]: CommercialSubCategoryMapper,
  [XmlValues.OfferType.CommercialRent]: CommercialSubCategoryMapper
}

const CategoryMapper = {
  [XmlValues.OfferType.ResidentialSale]: CategoriesCodes.RESIDENTIAL,
  [XmlValues.OfferType.ResidentialRent]: CategoriesCodes.RESIDENTIAL,
  [XmlValues.OfferType.CommercialSale]: CategoriesCodes.COMMERCIAL,
  [XmlValues.OfferType.CommercialRent]: CategoriesCodes.COMMERCIAL
}

const CompletionMapper = {
  [XmlValues.CompletionStatus.Completed]: CompletionEnum.Ready,
  [XmlValues.CompletionStatus.CompletedPrimary]: CompletionEnum.Ready,
  [XmlValues.CompletionStatus.OffPlan]: CompletionEnum.OffPlan,
  [XmlValues.CompletionStatus.OffPlanPrimary]: CompletionEnum.OffPlan
}

const FurnishedMapper = {
  [XmlValues.FurnishedStatus.Yes]: FurnishedEnum.Furnished,
  [XmlValues.FurnishedStatus.No]: FurnishedEnum.Unfurnished,
  [XmlValues.FurnishedStatus.Partially]: FurnishedEnum.PartiallyFurnished
}

const BasicAmenitiesMapper = {
  [XmlValues.OtherAmenitiesTypes.Covered_Parking]: AmenitiesCodes.ParkingSpace,
  [XmlValues.OtherAmenitiesTypes.Public_Park]: AmenitiesCodes.ParkingSpace,
  [XmlValues.OtherAmenitiesTypes.Basement_Parking]: AmenitiesCodes.ParkingSpace,
  [XmlValues.OtherAmenitiesTypes.Central_Air_Conditioning]:
    AmenitiesCodes.CentralAC,
  [XmlValues.OtherAmenitiesTypes.Children_s_Play_Area]:
    AmenitiesCodes.KidsPlayArea,
  [XmlValues.OtherAmenitiesTypes.Maintenance_24_Hours]:
    AmenitiesCodes.MaintenanceStaff,
  [XmlValues.OtherAmenitiesTypes.Broadband_Ready]: AmenitiesCodes.Internet,
  [XmlValues.OtherAmenitiesTypes.Balcony]: AmenitiesCodes.BalconyTerrace,
  [XmlValues.OtherAmenitiesTypes.Shared_Swimming_Pool]:
    AmenitiesCodes.SwimmingPool,
  [XmlValues.OtherAmenitiesTypes.Private_Swimming_Pool]:
    AmenitiesCodes.SwimmingPool,
  [XmlValues.OtherAmenitiesTypes.Gymnasium]: AmenitiesCodes.GymHealthClub,
  [XmlValues.OtherAmenitiesTypes.Sports_Academies]:
    AmenitiesCodes.GymHealthClub,
  [XmlValues.OtherAmenitiesTypes.Jacuzzi]: AmenitiesCodes.GymHealthClub,
  [XmlValues.OtherAmenitiesTypes.Sauna]: AmenitiesCodes.GymHealthClub,
  [XmlValues.OtherAmenitiesTypes.Clubhouse]: AmenitiesCodes.GymHealthClub,
  [XmlValues.OtherAmenitiesTypes.Maids_Room]: AmenitiesCodes.MaidsRoom
}

const AmenityCodeToFeatureMapper = {
  [XmlValues.AmenitiesCodes.BBQArea]: XmlValues.OtherAmenitiesTypes.BBQ_Area,
  [XmlValues.AmenitiesCodes.Balcony]: XmlValues.OtherAmenitiesTypes.Balcony,
  [XmlValues.AmenitiesCodes.BuiltInWardrobes]:
    XmlValues.OtherAmenitiesTypes.Built_in_Wardrobes,
  [XmlValues.AmenitiesCodes.CentralAirConditioning]:
    XmlValues.OtherAmenitiesTypes.Central_Air_Conditioning,
  [XmlValues.AmenitiesCodes.CoveredParking]:
    XmlValues.OtherAmenitiesTypes.Covered_Parking,
  [XmlValues.AmenitiesCodes.Gymnasium]: XmlValues.OtherAmenitiesTypes.Gymnasium,
  [XmlValues.AmenitiesCodes.MaidsRoom]:
    XmlValues.OtherAmenitiesTypes.Maids_Room,
  [XmlValues.AmenitiesCodes.PrivateGarden]:
    XmlValues.OtherAmenitiesTypes.Private_Garden,
  [XmlValues.AmenitiesCodes.Private_Swimming_Pool]:
    XmlValues.OtherAmenitiesTypes.Private_Swimming_Pool,
  [XmlValues.AmenitiesCodes.PrivateGarage]:
    XmlValues.OtherAmenitiesTypes.Private_Garage,
  [XmlValues.AmenitiesCodes.PetsAllowed]:
    XmlValues.OtherAmenitiesTypes.Pets_Allowed,
  [XmlValues.AmenitiesCodes.ChildrensPlayArea]:
    XmlValues.OtherAmenitiesTypes.Children_s_Play_Area,
  [XmlValues.AmenitiesCodes.ConciergeService]:
    XmlValues.OtherAmenitiesTypes.Concierge_Service,
  [XmlValues.AmenitiesCodes.CoveredParking]:
    XmlValues.OtherAmenitiesTypes.Covered_Parking,
  [XmlValues.AmenitiesCodes.FullyFittedKitchen]:
    XmlValues.OtherAmenitiesTypes.Fully_Fitted_Kitchen,
  [XmlValues.AmenitiesCodes.Jacuzzi]: XmlValues.OtherAmenitiesTypes.Jacuzzi,
  [XmlValues.AmenitiesCodes.Restaurants]:
    XmlValues.OtherAmenitiesTypes.Restaurants,
  [XmlValues.AmenitiesCodes.Sauna]: XmlValues.OtherAmenitiesTypes.Sauna,
  [XmlValues.AmenitiesCodes.Study]: XmlValues.OtherAmenitiesTypes.Study,
  [XmlValues.AmenitiesCodes.ViewOfWater]:
    XmlValues.OtherAmenitiesTypes.View_of_Sea_Water,
  [XmlValues.AmenitiesCodes.SharedSwimmingPool]:
    XmlValues.OtherAmenitiesTypes.Shared_Swimming_Pool
}

const RentalPeriodMapper = {
  [XmlValues.RentalPeriodTypes.Yearly]: RentDurationEnum.Yearly,
  [XmlValues.RentalPeriodTypes.Monthly]: RentDurationEnum.Monthly,
  [XmlValues.RentalPeriodTypes.Weekly]: RentDurationEnum.Weekly,
  [XmlValues.RentalPeriodTypes.Daily]: RentDurationEnum.Daily
}

export const Mappers = {
  OfferTypeMapper,
  CompletionMapper,
  FurnishedMapper,
  CategoryMapper,
  SubCategoryMapper,
  BasicAmenitiesMapper,
  AmenityCodeToFeatureMapper,
  RentalPeriodMapper
}
