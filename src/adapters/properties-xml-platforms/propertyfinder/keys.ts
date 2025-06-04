const Property = {
  Agent: 'agent',
  LastUpdate: 'last_update',
  ReferenceNumber: 'reference_number',
  OfferType: 'offering_type',
  Name: 'title_en',
  Description: 'description_en',
  Completion: 'completion_status',
  Furnished: 'furnished',
  LongLat: 'geopoints',
  City: 'city',
  Neighborhood: 'sub_community',
  State: 'community',
  Country: 'country',
  Media: {
    Key: 'photo',
    Url: 'url'
  },
  Street: 'property_name',
  Area: 'size',
  PlotArea: 'plot_size',
  Category: 'property_type',
  PermitNumber: 'permit_number',
  Amenities: 'amenities',
  Bedrooms: 'bedroom',
  Bathrooms: 'bathroom',
  Price: 'price',
  RentalPeriod: 'rental_period'
}

const PriceDuration = {
  Yearly: 'yearly',
  Monthly: 'monthly',
  Weekly: 'weekly',
  Daily: 'daily'
}

const Agent = {
  Name: 'name',
  Email: 'email',
  Phone: 'phone',
  Photo: 'photo',
  LicenseNumber: 'license_no'
}

export const XmlKeys = {
  Property,
  Agent,
  PriceDuration
}
