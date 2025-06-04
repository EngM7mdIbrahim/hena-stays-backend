import {
  AmenitiesCodes,
  CategoriesCodes,
  SubCategoriesCodes
} from '@commonTypes'

export const categoryCodeMapper = {
  commercial: CategoriesCodes.COMMERCIAL,
  residential: CategoriesCodes.RESIDENTIAL
}

export const subCategoryCodeMapper = {
  shop: SubCategoriesCodes.Shop,
  industrialland: SubCategoriesCodes.IndustrialLand,
  labourcamp: SubCategoriesCodes.LabourCamp,
  commercialbuilding: SubCategoriesCodes.Building,
  duplex: SubCategoriesCodes.Duplex,
  commercialplot: SubCategoriesCodes.Plot,
  othercommercial: SubCategoriesCodes.Other,
  warehouse: SubCategoriesCodes.Warehouse,
  otherresidential: SubCategoriesCodes.Other,
  commercialvilla: SubCategoriesCodes.Villa,
  office: SubCategoriesCodes.Office,
  mixeduseland: SubCategoriesCodes.MixedUseLand,
  apartment: SubCategoriesCodes.Apartment,
  penthouse: SubCategoriesCodes.Penthouse,
  hotelapartment: SubCategoriesCodes.HotelApartment,
  villa: SubCategoriesCodes.Villa,
  commercialfloor: SubCategoriesCodes.Floor,
  bulkunit: SubCategoriesCodes.BulkUnit,
  residentialplot: SubCategoriesCodes.Plot,
  showroom: SubCategoriesCodes.Showroom,
  studio: SubCategoriesCodes.Studio,
  townhouse: SubCategoriesCodes.Townhouse,
  villacompound: SubCategoriesCodes.VillaCompound,
  residentialbuilding: SubCategoriesCodes.Building,
  residentialfloor: SubCategoriesCodes.Floor
}

export const amenitiesCodeMapper = {
  centrallyairconditioned: AmenitiesCodes.CentralAC,
  internet: AmenitiesCodes.Internet,
  gymhealthclub: AmenitiesCodes.GymHealthClub,
  maintenancestaff: AmenitiesCodes.MaintenanceStaff,
  swimmingpool: AmenitiesCodes.SwimmingPool,
  cctvsecurity: AmenitiesCodes.CctvSecurity,
  parkingspace: AmenitiesCodes.ParkingSpace,
  balconyterrace: AmenitiesCodes.BalconyTerrace,
  wastedisposal: AmenitiesCodes.WasteDisposal,
  lobbyinbuilding: AmenitiesCodes.LobbyInBuilding,
  maidsroom: AmenitiesCodes.MaidsRoom,
  kidsplayarea: AmenitiesCodes.KidsPlayArea,
  securitystaff: AmenitiesCodes.SecurityStaff
}
