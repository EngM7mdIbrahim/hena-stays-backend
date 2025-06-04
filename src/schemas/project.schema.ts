import { MediaTypes, ProjectStatusEnum } from '@commonTypes'
import { MESSAGES } from '@constants'
import { ProjectModel } from '@models'
import { z } from 'zod'

export const ProjectCreationValidation = z
  .object({
    title: z.string().min(1, MESSAGES.required('title')),
    description: z.string().min(1, MESSAGES.required('description')),
    media: z
      .array(
        z.object({
          type: z.nativeEnum(MediaTypes),
          url: z.string().url(MESSAGES.invalid('url'))
        })
      )
      .min(1, MESSAGES.required('One media is required')),
    location: z.object({
      address: z.string().min(1, MESSAGES.required('address')),
      name: z.string().min(1, MESSAGES.required('location name')),
      country: z.string().min(1, MESSAGES.required('country')),
      state: z.string().optional(),
      city: z.string().min(1, MESSAGES.required('city')),
      coordinates: z.array(z.number()).min(2, MESSAGES.required('coordinates'))
    }),
    handOverDate: z.string().datetime(MESSAGES.invalid('hand over date')),
    paymentPlan: z.object({
      downPaymentPercentage: z.number(),
      fullPrice: z
        .object({
          preHandOverPercentage: z.number(),
          monthsNumber: z.number()
        })
        .nullable()
        .optional(),
      projectCompletion: z
        .array(
          z.object({
            mileStonePercentage: z.string(),
            order: z.number(),
            preHandOverPercentage: z.number()
          })
        )
        .optional(),
      onHandOverPercentage: z.number(),
      postHandOverPercentage: z.number()
    }),
    recommended: z.boolean().default(false)
  })
  .superRefine((values, ctx) => {
    const fullPricePercentage =
      values.paymentPlan?.fullPrice?.preHandOverPercentage
    const projectCompletion = values.paymentPlan?.projectCompletion
    const hasFullPrice = Boolean(fullPricePercentage)
    const hasProjectCompletion = Boolean(projectCompletion?.length)

    if (hasFullPrice === hasProjectCompletion) {
      ctx.addIssue({
        path: ['paymentPlan'],
        message: MESSAGES.PROJECTS.FULL_PRICE_OR_PROJECT_COMPLETION_REQUIRED,
        code: z.ZodIssueCode.custom
      })
      return
    }

    const projectMilestonesPercentage =
      projectCompletion?.reduce(
        (acc, item) => acc + (item.preHandOverPercentage || 0),
        0
      ) || 0
    const totalPercentage =
      values.paymentPlan.downPaymentPercentage +
      values.paymentPlan.onHandOverPercentage +
      values.paymentPlan.postHandOverPercentage +
      (fullPricePercentage ?? projectMilestonesPercentage)

    if (Math.ceil(totalPercentage) !== 100) {
      ctx.addIssue({
        path: ['paymentPlan'],
        message: MESSAGES.PROJECTS.TOTAL_PERCENTAGE,
        code: z.ZodIssueCode.custom
      })
    }
  })

export const ProjectUpdateValidation = z
  .object({
    id: z.string().min(1, MESSAGES.required('id')),
    title: z.string().min(1, MESSAGES.required('title')).optional(),
    description: z.string().min(1, MESSAGES.required('description')).optional(),
    media: z
      .array(
        z.object({
          type: z.nativeEnum(MediaTypes),
          url: z.string().url(MESSAGES.invalid('url'))
        })
      )
      .min(1, MESSAGES.required('One media is required'))
      .optional(),
    location: z
      .object({
        address: z.string().min(1, MESSAGES.required('address')),
        name: z.string().min(1, MESSAGES.required('location name')),
        country: z.string().min(1, MESSAGES.required('country')),
        state: z.string().optional(),
        city: z.string().min(1, MESSAGES.required('city')),
        coordinates: z
          .array(z.number())
          .min(2, MESSAGES.required('coordinates'))
      })
      .optional(),
    status: z.nativeEnum(ProjectStatusEnum).optional(),
    handOverDate: z
      .string()
      .datetime(MESSAGES.invalid('hand over date'))
      .optional(),
    paymentPlan: z
      .object({
        downPaymentPercentage: z.number().optional(),
        fullPrice: z
          .object({
            preHandOverPercentage: z.number(),
            monthsNumber: z.number()
          })
          .nullable()
          .optional(),
        projectCompletion: z
          .array(
            z.object({
              mileStonePercentage: z.string(),
              order: z.number(),
              preHandOverPercentage: z.number()
            })
          )
          .optional(),
        onHandOverPercentage: z.number().optional(),
        postHandOverPercentage: z.number().optional()
      })
      .optional(),
    recommended: z.boolean().optional()
  })
  .superRefine(async (data, ctx) => {
    const project = await ProjectModel.findById(data.id)

    if (!project) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MESSAGES.notFound('project'),
        path: [] // Error applies to the entire object
      })
      return
    }
    if (
      data.status &&
      data.status === ProjectStatusEnum.Active &&
      data.status !== project.status &&
      project.units.length == 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MESSAGES.PROJECTS.UNITS_REQUIRED,
        path: ['status'] // Error applies to the entire object
      })
    }
    if (!data.paymentPlan) {
      return
    }

    const isFullPrice = Boolean(
      data.paymentPlan.fullPrice?.preHandOverPercentage
    )
    const isProjectCompletion = Boolean(
      data.paymentPlan.projectCompletion?.length
    )
    if (isFullPrice && isProjectCompletion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MESSAGES.PROJECTS.FULL_PRICE_OR_PROJECT_COMPLETION_REQUIRED,
        path: [] // Error applies to the entire object
      })
      return
    }
    const downPaymentPercentage =
      data.paymentPlan.downPaymentPercentage ??
      project?.paymentPlan?.downPaymentPercentage
    const onHandOverPercentage =
      data.paymentPlan.onHandOverPercentage ??
      project?.paymentPlan?.onHandOverPercentage
    const postHandOverPercentage =
      data.paymentPlan.postHandOverPercentage ??
      project?.paymentPlan?.postHandOverPercentage
    let fullPricePreHandOverPercentage =
      data.paymentPlan.fullPrice?.preHandOverPercentage ??
      project?.paymentPlan?.fullPrice?.preHandOverPercentage ??
      0
    let projectCompletion =
      data.paymentPlan.projectCompletion ||
      project?.paymentPlan?.projectCompletion ||
      []

    if (data.paymentPlan.fullPrice?.preHandOverPercentage) {
      projectCompletion = []
    }
    if (data.paymentPlan.projectCompletion?.length) {
      fullPricePreHandOverPercentage = 0
    }

    const totalPercentage =
      downPaymentPercentage +
      onHandOverPercentage +
      postHandOverPercentage +
      fullPricePreHandOverPercentage +
      projectCompletion.reduce((acc, item) => {
        const preHandOverPercentage = item.preHandOverPercentage ?? 0
        return acc + preHandOverPercentage
      }, 0)

    // Ensure total payment percentages add up to 100
    if (Math.ceil(totalPercentage) !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total payment percentages should be equal to 100%',
        path: [] // Error applies to the entire object
      })
    }
  })
