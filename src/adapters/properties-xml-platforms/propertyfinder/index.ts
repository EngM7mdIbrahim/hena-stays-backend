import { PropertiesXMLAdapter } from '@contracts'

import { Extractors } from './extractors'
import { XmlKeys } from './keys'
import { Mappers } from './mappers'
import { XmlValues } from './values'

const PropertyFinderPlugin: PropertiesXMLAdapter = {
  extractors: Extractors,
  mappers: Mappers,
  keys: XmlKeys,
  values: XmlValues
}

export const propertyfinder = PropertyFinderPlugin
