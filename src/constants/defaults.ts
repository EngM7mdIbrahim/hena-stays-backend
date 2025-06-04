import {
  AmenitiesCodes,
  Amenity,
  CategoriesCodes,
  Category,
  CompletionEnum,
  FurnishedEnum,
  SaleTypeEnum,
  SubCategoriesCodes,
  SubCategory,
  User,
  XMLAgent,
  XMLProperty
} from '@commonTypes'

export const DEFAULT_NEAR_ME_RADIUS = 10
export const DEFAULT_USER_SUPPORT_INFO: Pick<
  User,
  'name' | 'email' | 'phone' | 'whatsapp' | 'chatMeta'
> & { altName: string } = {
  name: 'TrueDar',
  altName: 'Help Center',
  email: 'info@truedar.ae',
  phone: '+971526931043',
  whatsapp: '+971526931043',
  chatMeta: {
    online: true,
    typing: false
  }
}

export const DEFAULT_PROPERTY_DTO: XMLProperty = {
  description: '- ',
  type: SaleTypeEnum.Sale,
  completion: CompletionEnum.OffPlan,
  furnished: FurnishedEnum.Unfurnished,
  location: {
    address: '-',
    country: 'United Arab Emirates',
    state: '-',
    city: '-',
    neighborhoods: '-',
    street: '-',
    coordinates: [0, 0],
    type: 'Point',
    name: '-'
  },
  media: [],
  price: {
    value: 0,
    currency: 'AED',
    duration: null
  },

  toilets: 0,
  bedroom: 0,
  area: {
    plot: 0,
    builtIn: 0
  },
  permit: {
    number: '-',
    BRN: '-'
  },
  amenities: {
    basic: [],
    other: []
  },
  category: CategoriesCodes.RESIDENTIAL,
  subCategory: SubCategoriesCodes.Other,
  xmlMetaData: {
    lastUpdated: new Date(),
    referenceNumber: '-'
  },
  createdBy: '',
  title: '-'
}

export const DEFAULT_AGENT_DTO: XMLAgent = {
  name: '-',
  phone: '-',
  email: '-',
  image: null,
  properties: []
}

export const DEFAULT_AMENITIES: (Omit<Amenity, '_id' | 'createdAt'> & {
  _id?: string
})[] = [
  {
    code: AmenitiesCodes.ParkingSpace,
    name: 'Parking Space',
    image: 'src/assets/amenities/1.svg'
  },
  {
    code: AmenitiesCodes.CentralAC,
    name: 'Centrally-air conditioned',
    image: 'src/assets/amenities/2.svg'
  },
  {
    code: AmenitiesCodes.BalconyTerrace,
    name: 'Balcony / Terrace',
    image: 'src/assets/amenities/3.svg'
  },
  {
    code: AmenitiesCodes.SwimmingPool,
    name: 'Swimming Pool',
    image: 'src/assets/amenities/4.svg'
  },
  {
    code: AmenitiesCodes.Internet,
    name: 'Internet',
    image: 'src/assets/amenities/5.svg'
  },
  {
    code: AmenitiesCodes.MaidsRoom,
    name: "Maid's Room",
    image: 'src/assets/amenities/6.svg'
  },
  {
    code: AmenitiesCodes.KidsPlayArea,
    name: 'Kids Play Area',
    image: 'src/assets/amenities/7.svg'
  },
  {
    code: AmenitiesCodes.LobbyInBuilding,
    name: 'Lobby in Building',
    image: 'src/assets/amenities/8.svg'
  },
  {
    code: AmenitiesCodes.CctvSecurity,
    name: 'CCTV Security',
    image: 'src/assets/amenities/9.svg'
  },
  {
    code: AmenitiesCodes.GymHealthClub,
    name: 'Gym / Health Club',
    image: 'src/assets/amenities/10.svg'
  },
  {
    code: AmenitiesCodes.WasteDisposal,
    name: 'Waste Disposal',
    image: 'src/assets/amenities/11.svg'
  },
  {
    code: AmenitiesCodes.MaintenanceStaff,
    name: 'Maintenance Staff',
    image: 'src/assets/amenities/12.svg'
  },
  {
    code: AmenitiesCodes.SecurityStaff,
    name: 'Security Staff',
    image: 'src/assets/amenities/13.svg'
  }
]

export const DEFAULT_SUBCATEGORIES: (Omit<
  SubCategory,
  '_id' | 'createdAt' | 'category'
> & {
  _id?: string
  category?: string
  categoryCode: string
})[] = [
  {
    code: SubCategoriesCodes.Apartment,
    name: 'Apartment',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 0
  },
  {
    code: SubCategoriesCodes.Building,
    name: 'Building',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 1
  },
  {
    code: SubCategoriesCodes.Duplex,
    name: 'Duplex',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 2
  },
  {
    code: SubCategoriesCodes.Floor,
    name: 'Floor',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 3
  },
  {
    code: SubCategoriesCodes.HotelApartment,
    name: 'Hotel Apartment',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 4
  },
  {
    code: SubCategoriesCodes.Penthouse,
    name: 'Penthouse',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 5
  },
  {
    code: SubCategoriesCodes.Villa,
    name: 'Villa',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 6
  },
  {
    code: SubCategoriesCodes.VillaCompound,
    name: 'Villa Compound',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 7
  },
  {
    code: SubCategoriesCodes.Other,
    name: 'Other',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 8
  },
  {
    code: SubCategoriesCodes.Plot,
    name: 'Plot',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 9
  },
  {
    code: SubCategoriesCodes.Shop,
    name: 'Shop',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 10
  },
  {
    code: SubCategoriesCodes.Warehouse,
    name: 'Warehouse',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 11
  },
  {
    code: SubCategoriesCodes.IndustrialLand,
    name: 'Industrial Land',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 12
  },
  {
    code: SubCategoriesCodes.LabourCamp,
    name: 'Labour Camp',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 13
  },
  {
    code: SubCategoriesCodes.BulkUnit,
    name: 'Bulk Unit',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 14
  },
  {
    code: SubCategoriesCodes.Showroom,
    name: 'Showroom',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 15
  },
  {
    code: SubCategoriesCodes.Office,
    name: 'Office',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 16
  },
  {
    code: SubCategoriesCodes.Studio,
    name: 'Studio',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 17
  },
  {
    code: SubCategoriesCodes.Townhouse,
    name: 'Townhouse',
    categoryCode: CategoriesCodes.RESIDENTIAL,
    sortOrder: 18
  },
  {
    code: SubCategoriesCodes.MixedUseLand,
    name: 'Mixed Use Land',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 19
  },
  {
    code: SubCategoriesCodes.Farm,
    name: 'Farm',
    categoryCode: CategoriesCodes.COMMERCIAL,
    sortOrder: 26
  }
]

export const DEFAULT_CATEGORIES: (Omit<Category, '_id' | 'createdAt'> & {
  _id?: string
})[] = [
  {
    code: CategoriesCodes.RESIDENTIAL,
    name: 'Residential'
  },
  {
    code: CategoriesCodes.COMMERCIAL,
    name: 'Commercial'
  }
]
