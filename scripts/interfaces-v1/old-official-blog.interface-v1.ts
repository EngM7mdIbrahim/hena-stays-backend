import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldOfficialBlog extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  user: Types.ObjectId
  title: string
  description: string
  content: string
  media: {
    url: string
    type: 'image'
    alt: string
  }[]
  faq: {
    question: string
    answer: string
  }[]
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  relatedBlogs: Types.ObjectId[]
  slug: string
  published: boolean
  scheduledAt: null | Date
  tableOfContents: string
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}
