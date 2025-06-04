import { env } from '@config'
import { MESSAGES } from '@constants'
import { AppError, IEmailService } from '@contracts'
import ejs from 'ejs'
import nodemailer from 'nodemailer'
import validator from 'validator'

import { loggerService } from './logger.service'

class EmailService implements IEmailService {
  private transporter
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: parseInt(JSON.stringify(env.EMAIL_PORT) || '465', 10),
      secure: true,
      auth: {
        user: env.EMAIL_MAIL,
        pass: env.EMAIL_PASS
      }
    })
  }
  async sendRegisterEmailWithPassword(email: string, password: string) {
    try {
      const subject = 'Action Required: Verify Your Email for Account Creation.'
      const message = `Your password is: ${password}\n\nIf you didn't initiate this account creation or have any concerns, please contact our support team immediately.`
      const html = await ejs.renderFile('src/views/new-account.ejs', {
        data: { email, password }
      })
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async sendOTPEmail(email: string, otp: string, time: string): Promise<void> {
    try {
      const subject = 'Action Required: Verify Your Email for Account Creation.'
      const message = `Your One Time Password is: ${otp}\n\nThis OTP is valid for ${time}. Do not share it with anyone for security reasons.\n\nIf you didn't initiate this account creation or have any concerns, please contact our support team immediately.`
      const html = await ejs.renderFile('src/views/otp-email.ejs', {
        data: { otp: otp, time: time }
      })

      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }

  async sendForgetPasswordEmail(
    email: string,
    resetLink: string,
    time: string
  ): Promise<void> {
    try {
      const subject = 'Action Required: Reset Your Password.'
      const message = `Click on the link below to reset your password.\n\n${resetLink}\n\nIf you didn't initiate this password reset or have any concerns, please contact our support team immediately.`
      const html = await ejs.renderFile('src/views/reset-otp-email.ejs', {
        data: { resetLink: resetLink, time: time }
      })

      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }

  async sendNewLeadEmail(
    email: string,
    name: string,
    url: string
  ): Promise<void> {
    try {
      const subject = 'New Lead'
      const html = await ejs.renderFile('src/views/new-lead.ejs', {
        data: { name, url }
      })
      const message = `New lead: ${name}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async sendPropertiesXmlApprovedEmail(
    email: string,
    name: string,
    url: string
  ) {
    try {
      const subject = 'Properties XML Approved'
      const html = await ejs.renderFile('src/views/properties-xml.ejs', {
        data: { name, url }
      })
      const message = `Properties XML approved for: ${name} with URL: ${url}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }

  async sendPropertiesXmlRejectedEmail(
    email: string,
    name: string,
    url: string,
    rejectionMessage: string
  ) {
    try {
      const subject = 'Properties XML Rejected'
      const html = await ejs.renderFile(
        'src/views/properties-xml/rejected.ejs',
        {
          data: { name, url, message: rejectionMessage }
        }
      )
      const message = `Properties XML rejected for: ${name} with URL: ${url}\n\nReason: ${rejectionMessage}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async propertiesXmlImportedEmail(email: string, name: string, url: string) {
    try {
      const subject = 'Properties XML Imported'
      const html = await ejs.renderFile(
        'src/views/properties-xml/imported-owner.ejs',
        {
          data: { name, url }
        }
      )
      const message = `Properties XML imported for: ${name} with URL: ${url}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async sendPropertiesXmlAgentImportsEmail(
    email: string,
    name: string,
    creatorName: string,
    creatorRole: string,
    isNewUser: boolean
  ) {
    try {
      const subject = 'Properties XML Imported'
      const html = await ejs.renderFile(
        'src/views/properties-xml/imported-agent.ejs',
        {
          data: { name, creator: creatorName, role: creatorRole, isNewUser }
        }
      )
      const message = `Properties XML imported for: ${name} by ${creatorName} (${creatorRole})`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async newPropertiesFromXMLFeed(
    email: string,
    name: string,
    url: string,
    properties: string
  ) {
    try {
      const subject = 'New Properties From XML Feed'
      const html = await ejs.renderFile(
        'src/views/xml-properties/new-properties-feed.ejs',
        {
          data: { name, url, properties }
        }
      )
      const message = `New properties from XML feed for: ${name} with URL: ${url}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async updatedPropertiesFromXMLFeed(email: string, name: string, url: string) {
    try {
      const subject = 'Updated Properties From XML Feed'
      const html = await ejs.renderFile(
        'src/views/xml-properties/updated.ejs',
        {
          data: { name, url }
        }
      )
      const message = `Updated properties from XML feed for: ${name} with URL: ${url}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async sendAcceptCreditsRequestEmail(
    email: string,
    name: string,
    credits: number
  ) {
    try {
      const subject = 'Accepted Credits Request'
      const html = await ejs.renderFile('src/views/credits-accepted.ejs', {
        data: { name, credits }
      })
      const message = `Accepted credits request for: ${name} with ${credits} credits`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async sendRejectCreditsRequestEmail(
    email: string,
    name: string,
    credits: number,
    rejectionMessage: string
  ) {
    try {
      const subject = 'Rejected Credits Request'
      const html = await ejs.renderFile('src/views/credits-rejected.ejs', {
        data: { name, credits, message: rejectionMessage }
      })
      const message = `Rejected credits request for: ${name} with ${credits} credits\n\nReason: ${rejectionMessage}`
      await this.sendEmail(email, subject, message, html)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }
  async sendEmail(
    email: string,
    subject: string,
    message: string,
    html?: string
  ): Promise<void> {
    try {
      const testMails = [
        'antoniosamy14@gmail.com',
        'tonysamy200@gmail.com',
        'tonysamybuffon@gmail.com',
        'filobaternader14@gmail.com',
        'mohamed.ibrahim.truedar@gmail.com',
        'devbenho@gmail.com',
        'jrbanhawy@gmail.com',
        'elyas.a.77@hotmail.com',
        'elyas.alkhoutani@gmail.com',
        'elyasrozi@gmail.com',
        'elyasrozi@hotmail.com',
        'mostafaelghazoly188@gmail.com',
        'ahmedgamaldev423@gmail.com',
        'mohamedibrahimtruedar@gmail.com',
        'tonysamy100@gmail.com'
      ]
      if (env.APP_ENV !== 'prod') {
        const sanitizedEmail = validator.normalizeEmail(email) as string
        if (!testMails.includes(sanitizedEmail)) {
          loggerService.log(
            `Email not sent because the environment is not production and this email ${email} is not in the test list.`
          )
          return
        }
      }
      const mailOptions = {
        from: env.EMAIL_MAIL, // Sender email address
        to: email, // Recipient's email
        subject: subject, // Email subject
        text: message, // Email content (plain text)
        html
      }

      // Send email using transporter
      await this.transporter.sendMail(mailOptions)
      loggerService.log('Email sent successfully to ' + email)
    } catch (error) {
      loggerService.error('Error sending email:' + error)
      throw new Error(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR)
    }
  }
}

export const emailService = new EmailService()
