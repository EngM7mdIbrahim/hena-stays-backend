import { loggerService } from '@services'
import axios from 'axios'
import { parseStringPromise, processors } from 'xml2js'

class XMLManagerService {
  async parse(xmlString: string): Promise<Record<string, unknown>> {
    try {
      const result = await parseStringPromise(xmlString, {
        explicitArray: false,
        trim: true,
        explicitRoot: false,
        mergeAttrs: true,
        valueProcessors: [processors.parseNumbers], // Convert numbers from string
        attrValueProcessors: [processors.parseNumbers], // Convert numbers in attributes
        tagNameProcessors: [processors.stripPrefix] // Remove prefixes from tags
      })
      return result
    } catch (error) {
      loggerService.error(`Error parsing XML: ${error}`)
      throw new Error('Failed to parse XML')
    }
  }

  async fetch(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    return response.data
  }
}

export const xmlManagerService = new XMLManagerService()
