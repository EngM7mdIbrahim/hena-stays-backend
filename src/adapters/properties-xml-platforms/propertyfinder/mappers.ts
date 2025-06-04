import {
  AmenitiesCodes,
  CategoriesCodes,
  CompletionEnum,
  FurnishedEnum,
  RentDurationEnum,
  SaleTypeEnum,
  SubCategoriesCodes
} from '@commonTypes'
import { PropertiesXMLAdapter } from '@contracts'

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
  [XmlValues.PropertyTypes.Farm]: SubCategoriesCodes.Farm,
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
  [XmlValues.AmenitiesTypes.CoveredParking]: AmenitiesCodes.ParkingSpace,
  [XmlValues.AmenitiesTypes.CentralACHeating]: AmenitiesCodes.CentralAC,
  [XmlValues.AmenitiesTypes.LobbyInBuilding]: AmenitiesCodes.LobbyInBuilding,
  [XmlValues.AmenitiesTypes.Internet]: AmenitiesCodes.Internet,
  [XmlValues.AmenitiesTypes.ChildrenPlayArea]: AmenitiesCodes.KidsPlayArea,
  [XmlValues.AmenitiesTypes.MaintenanceStaff]: AmenitiesCodes.MaintenanceStaff,
  [XmlValues.AmenitiesTypes.Security]: AmenitiesCodes.CctvSecurity,
  [XmlValues.AmenitiesTypes.Balcony]: AmenitiesCodes.BalconyTerrace,
  [XmlValues.AmenitiesTypes.SharedPool]: AmenitiesCodes.SwimmingPool,
  [XmlValues.AmenitiesTypes.PrivatePool]: AmenitiesCodes.SwimmingPool,
  [XmlValues.AmenitiesTypes.ChildrenPool]: AmenitiesCodes.KidsPlayArea,
  [XmlValues.AmenitiesTypes.SharedGym]: AmenitiesCodes.GymHealthClub,
  [XmlValues.AmenitiesTypes.PrivateGym]: AmenitiesCodes.GymHealthClub,
  [XmlValues.AmenitiesTypes.SharedSpa]: AmenitiesCodes.GymHealthClub,
  [XmlValues.AmenitiesTypes.MaidRoom]: AmenitiesCodes.MaidsRoom,
  [XmlValues.AmenitiesTypes.Security]: AmenitiesCodes.SecurityStaff
}

const OtherAmenitiesMapper = {
  [XmlValues.AmenitiesTypes.CentralACHeating]:
    XmlValues.OtherAmenitiesTypes.CentralA_C_Heating,
  [XmlValues.AmenitiesTypes.Balcony]: XmlValues.OtherAmenitiesTypes.Balcony,
  [XmlValues.AmenitiesTypes.BuiltInKitchenAppliances]:
    XmlValues.OtherAmenitiesTypes.Built_in_Kitchen_Appliances,
  [XmlValues.AmenitiesTypes.ViewOfLandmark]:
    XmlValues.OtherAmenitiesTypes.View_of_Landmark,
  [XmlValues.AmenitiesTypes.BuiltInWardrobes]:
    XmlValues.OtherAmenitiesTypes.Built_in_Wardrobes,
  [XmlValues.AmenitiesTypes.CoveredParking]:
    XmlValues.OtherAmenitiesTypes.Covered_Parking,
  [XmlValues.AmenitiesTypes.ConciergeService]:
    XmlValues.OtherAmenitiesTypes.Concierge_Service,
  [XmlValues.AmenitiesTypes.LobbyInBuilding]:
    XmlValues.OtherAmenitiesTypes.Lobby_in_Building,
  [XmlValues.AmenitiesTypes.MaidService]:
    XmlValues.OtherAmenitiesTypes.Maid_Service,
  [XmlValues.AmenitiesTypes.PetsAllowed]:
    XmlValues.OtherAmenitiesTypes.Pets_Allowed,
  [XmlValues.AmenitiesTypes.PrivateGarden]:
    XmlValues.OtherAmenitiesTypes.Private_Garden,
  [XmlValues.AmenitiesTypes.PrivateJacuzzi]:
    XmlValues.OtherAmenitiesTypes.Private_Jacuzzi,
  [XmlValues.AmenitiesTypes.PrivatePool]:
    XmlValues.OtherAmenitiesTypes.Private_Pool,
  [XmlValues.AmenitiesTypes.PrivateGym]:
    XmlValues.OtherAmenitiesTypes.Private_Gym,
  [XmlValues.AmenitiesTypes.VastuCompliant]:
    XmlValues.OtherAmenitiesTypes.Vastu_compliant,
  [XmlValues.AmenitiesTypes.Security]: XmlValues.OtherAmenitiesTypes.Security,
  [XmlValues.AmenitiesTypes.SharedPool]:
    XmlValues.OtherAmenitiesTypes.Shared_Pool,
  [XmlValues.AmenitiesTypes.SharedSpa]:
    XmlValues.OtherAmenitiesTypes.Shared_Spa,
  [XmlValues.AmenitiesTypes.Study]: XmlValues.OtherAmenitiesTypes.Study,
  [XmlValues.AmenitiesTypes.SharedGym]:
    XmlValues.OtherAmenitiesTypes.Shared_Gym,
  [XmlValues.AmenitiesTypes.ViewOfWater]:
    XmlValues.OtherAmenitiesTypes.View_of_Water,
  [XmlValues.AmenitiesTypes.WalkInCloset]:
    XmlValues.OtherAmenitiesTypes.Walk_in_Closet,
  [XmlValues.AmenitiesTypes.ChildrensPool]:
    XmlValues.OtherAmenitiesTypes.Children_s_Pool,
  [XmlValues.AmenitiesTypes.ChildrensPlayArea]:
    XmlValues.OtherAmenitiesTypes.Children_s_Play_Area,
  [XmlValues.AmenitiesTypes.BarbecueArea]:
    XmlValues.OtherAmenitiesTypes.Barbecue_Area,
  [XmlValues.AmenitiesTypes.ConferenceRoom]:
    XmlValues.OtherAmenitiesTypes.Conference_Room,
  [XmlValues.AmenitiesTypes.AvailableNetworked]:
    XmlValues.OtherAmenitiesTypes.Available_Networked,
  [XmlValues.AmenitiesTypes.Pantry]: XmlValues.OtherAmenitiesTypes.Pantry,
  [XmlValues.AmenitiesTypes.Mezzanine]: XmlValues.OtherAmenitiesTypes.Mezzanine,
  [XmlValues.AmenitiesTypes.DiningInBuilding]:
    XmlValues.OtherAmenitiesTypes.Dining_in_building
}

const RentalPeriodMapper = {
  [XmlValues.RentalPeriodTypes.Yearly]: RentDurationEnum.Yearly,
  [XmlValues.RentalPeriodTypes.Monthly]: RentDurationEnum.Monthly,
  [XmlValues.RentalPeriodTypes.Weekly]: RentDurationEnum.Weekly,
  [XmlValues.RentalPeriodTypes.Daily]: RentDurationEnum.Daily
}

export const Mappers: PropertiesXMLAdapter['mappers'] = {
  OfferTypeMapper,
  CompletionMapper,
  FurnishedMapper,
  SubCategoryMapper,
  CategoryMapper,
  BasicAmenitiesMapper,
  OtherAmenitiesMapper,
  RentalPeriodMapper
}
