import { Document } from 'mongoose'

// Overload signatures
export function serializeDto<T>(document: Document): T
export function serializeDto<_T>(document: null | undefined): null
export function serializeDto<T>(document: Document | null | undefined): T | null

// Implementation
export function serializeDto<T>(document?: Document | null): T | null {
  if (document == null) {
    return null
  }
  return document.toJSON()
}
