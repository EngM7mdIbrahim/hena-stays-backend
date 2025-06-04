import {
  ActionToTakeTypes,
  CreateLeadsRequest,
  CreateLeadsResponse,
  DeleteLeadsRequestParams,
  DeleteLeadsResponse,
  GetAllLeadsQuery,
  GetAllLeadsResponse,
  GetLeadParams,
  GetLeadQuery,
  GetLeadResponse,
  Leads,
  LeadsStatusEnum,
  UpdateLeadsRequestBody,
  UpdateLeadsRequestParams,
  UpdateLeadsResponse
} from '@commonTypes'
import { IUserDocument, PopulatedLeadsDocument } from '@contracts'
import { emailService, leadsService, userService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

async function getInterestedUsers(lead: PopulatedLeadsDocument) {
  let users: IUserDocument[] = []
  if (lead.property?.createdBy) {
    const owner = await userService.readOne<IUserDocument>(
      { _id: lead.property?.createdBy },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (owner!.company) {
      users = (await userService.findAll({ company: owner!.company })).results
    } else {
      users = [owner!]
    }
  }
  return users
}
class LeadController {
  async getAll(
    req: Request<any, any, any, GetAllLeadsQuery>,
    res: Response<GetAllLeadsResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)

    const populateFields = populationBuilder(req.query.showFields)

    const leads = await leadsService.findAll<PopulatedLeadsDocument>(filter, {
      limit,
      page,
      sort,
      populateFields
    })

    return sendSuccessResponse(res, {
      items: leads.results.map((lead) => serializeDto<Leads>(lead)),
      limit,
      page,
      total: leads.totalResults,
      totalPages: leads.totalPages
    })
  }

  async getOne(
    req: Request<GetLeadParams, any, any, GetLeadQuery>,
    res: Response<GetLeadResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)
    const lead = await leadsService.readOne(
      { _id: req.params.id },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    return sendSuccessResponse(res, {
      lead: serializeDto<Leads>(lead!)
    })
  }

  async create(
    req: Request<any, any, CreateLeadsRequest>,
    res: Response<CreateLeadsResponse>
  ) {
    const lead = await leadsService.create(
      {
        contactType: req.body.contactType,
        name: req.user?.name ?? '-',
        property: req.body.property,
        user: req.user ? String(req.user._id) : undefined,
        status: LeadsStatusEnum.Pending,
        userContactDetails: {
          email: req.user?.email ?? '-',
          phone: req.user?.phone ?? '-',
          whatsapp: req.user?.whatsapp ?? '-'
        }
      },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(
      res,
      {
        lead: serializeDto<Leads>(lead)
      },
      201
    )
  }

  async updateOne(
    req: Request<UpdateLeadsRequestParams, any, UpdateLeadsRequestBody>,
    res: Response<UpdateLeadsResponse>
  ) {
    const preLead = await leadsService.readOne<PopulatedLeadsDocument>(
      {
        _id: req.params.id
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields: ['user', 'property']
      }
    )
    if (
      req.body.status === LeadsStatusEnum.Approved &&
      preLead?.status !== LeadsStatusEnum.Approved
    ) {
      // send email for the interested users
      const interestedUsers = await getInterestedUsers(preLead!)
      for (const user of interestedUsers) {
        // send email
        emailService.sendNewLeadEmail(
          user!.email,
          preLead!.name ?? preLead!.user?.name ?? '-',
          'Lead Approved'
        )
      }
    }
    const lead = await leadsService.update({ _id: req.params.id }, req.body, {
      actor: getActorData(req)
    })
    return sendSuccessResponse(res, {
      lead: serializeDto<Leads>(lead)
    })
  }

  async deleteOne(
    req: Request<DeleteLeadsRequestParams>,
    res: Response<DeleteLeadsResponse>
  ) {
    const lead = await leadsService.delete(
      { _id: req.params.id },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(
      res,
      {
        lead: serializeDto<Leads>(lead)
      },
      204
    )
  }
}

export const leadController = new LeadController()
