import {
  ActionToTakeTypes,
  ContactUs,
  CreateContactUsRequest,
  CreateContactUsResponse,
  DeleteContactUsRequestParams,
  DeleteContactUsResponse,
  FindAllContactUsRequestQuery,
  FindAllContactUsResponse,
  GetContactUsRequestParams,
  GetContactUsResponse,
  UpdateContactUsRequestBody,
  UpdateContactUsRequestParams,
  UpdateContactUsResponse
} from '@commonTypes'
import { contactUsService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class ContactUsController {
  async getAll(
    req: Request<any, any, any, FindAllContactUsRequestQuery>,
    res: Response<FindAllContactUsResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)

    const contactUsList = await contactUsService.findAll(filter, {
      limit,
      page,
      sort
    })
    sendSuccessResponse(res, {
      items: contactUsList.results.map((contactUs) =>
        serializeDto<ContactUs>(contactUs)
      ),
      total: contactUsList.totalResults,
      limit,
      page,
      totalPages: contactUsList.totalPages,
      hasNext: contactUsList.page < contactUsList.totalPages,
      nextPage:
        contactUsList.page < contactUsList.totalPages
          ? contactUsList.page + 1
          : undefined
    })
  }

  async getOne(
    req: Request<GetContactUsRequestParams, any, any, any>,
    res: Response<GetContactUsResponse>
  ) {
    const contactUs = await contactUsService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { contactUs: serializeDto<ContactUs>(contactUs!) })
  }

  async create(
    req: Request<any, any, CreateContactUsRequest>,
    res: Response<CreateContactUsResponse>
  ) {
    const contactUs = await contactUsService.create(req.body, {
      actor: getActorData(req)
    })
    sendSuccessResponse(res, { contactUs: serializeDto<ContactUs>(contactUs) })
  }

  async update(
    req: Request<UpdateContactUsRequestParams, any, UpdateContactUsRequestBody>,
    res: Response<UpdateContactUsResponse>
  ) {
    let contactUs = await contactUsService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    await contactUsService.update({ _id: req.params.id }, req.body, {
      actor: getActorData(req)
    })
    contactUs = await contactUsService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { contactUs: serializeDto<ContactUs>(contactUs) })
  }

  async delete(
    req: Request<DeleteContactUsRequestParams>,
    res: Response<DeleteContactUsResponse>
  ) {
    const contactUs = await contactUsService.delete(
      { _id: req.params.id },
      { actor: getActorData(req) }
    )
    sendSuccessResponse(
      res,
      { contactUs: serializeDto<ContactUs>(contactUs) },
      204
    )
  }
}

export const contactUsController = new ContactUsController()
