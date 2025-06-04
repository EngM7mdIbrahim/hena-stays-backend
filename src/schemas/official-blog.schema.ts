import { MediaTypes } from '@commonTypes'
import { MESSAGES } from '@constants'
import { OfficialBlogModel } from '@models'
import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const CreateOfficialBlogValidation = z.object({
  title: z.string().min(1, MESSAGES.required('title')),
  description: z.string().min(1, MESSAGES.required('description')),
  media: z.object({
    type: z.nativeEnum(MediaTypes),
    url: z.string().url(MESSAGES.invalid('url')),
    alt: z.string().min(1, MESSAGES.required('alt'))
  }),
  content: z.string().min(1, MESSAGES.required('content')),
  tableOfContents: z.string().min(1, MESSAGES.required('table of contents')),
  faq: z
    .array(
      z.object({
        question: z.string().min(1, MESSAGES.required('question')),
        answer: z.string().min(1, MESSAGES.required('answer'))
      })
    )
    .min(1, MESSAGES.required('at least one faq')),
  seo: z.object({
    title: z.string().min(1, MESSAGES.required('seo title')),
    description: z.string().min(1, MESSAGES.required('seo description')),
    keywords: z
      .array(z.string())
      .min(1, MESSAGES.required('at least one keyword'))
  }),
  createdBy: MongoIdSchema,
  slug: z
    .string()
    .min(1, MESSAGES.required('slug'))
    .refine(
      async (value) => {
        const officialBlog = await OfficialBlogModel.findOne({ slug: value })
        return !officialBlog
      },
      {
        message: MESSAGES.alreadyExists('slug')
      }
    ),
  published: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional(),
  relatedBlogs: z.array(MongoIdSchema).optional()
})

export const UpdateOfficialBlogValidation =
  CreateOfficialBlogValidation.partial()
