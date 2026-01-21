import nodemailer from 'nodemailer'
import {
  generateTicketConfirmationEmail,
  generateEventApprovedEmail,
  generateEventRejectedEmail,
  generateWelcomeEmail
} from './email-templates'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
    console.log('Message sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// =============================================
// TICKET CONFIRMATION EMAIL
// =============================================
interface SendTicketEmailParams {
  to: string
  customerName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  ticketType: string
  ticketQuantity: number
  orderId: string
  orderTotal: string
  qrCodeUrl: string
}

export async function sendTicketConfirmationEmail(params: SendTicketEmailParams) {
  const html = generateTicketConfirmationEmail({
    ...params,
    ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/my-tickets`
  })

  return sendEmail({
    to: params.to,
    subject: `🎟️ Your tickets for ${params.eventTitle} are confirmed!`,
    html
  })
}

// =============================================
// EVENT APPROVAL EMAILS
// =============================================
interface SendEventApprovalEmailParams {
  to: string
  organizerName: string
  eventTitle: string
  eventSlug: string
}

export async function sendEventApprovedEmail(params: SendEventApprovalEmailParams) {
  const html = generateEventApprovedEmail(params)

  return sendEmail({
    to: params.to,
    subject: `🎉 Your event "${params.eventTitle}" has been approved!`,
    html
  })
}

interface SendEventRejectedEmailParams {
  to: string
  organizerName: string
  eventTitle: string
  rejectionReason: string
}

export async function sendEventRejectedEmail(params: SendEventRejectedEmailParams) {
  const html = generateEventRejectedEmail(params)

  return sendEmail({
    to: params.to,
    subject: `Update on your event "${params.eventTitle}"`,
    html
  })
}

// =============================================
// WELCOME EMAIL
// =============================================
interface SendWelcomeEmailParams {
  to: string
  userName: string
}

export async function sendWelcomeEmail(params: SendWelcomeEmailParams) {
  const html = generateWelcomeEmail(params)

  return sendEmail({
    to: params.to,
    subject: `🎉 Welcome to EventHub, ${params.userName}!`,
    html
  })
}

// =============================================
// LEGACY FUNCTION (backward compatibility)
// =============================================
export function generateTicketEmailHtml(eventTitle: string, ticketType: string, qrCodeUrl: string, orderId: string) {
  return generateTicketConfirmationEmail({
    customerName: 'Valued Customer',
    eventTitle,
    eventDate: 'See ticket details',
    eventTime: 'See ticket details',
    eventLocation: 'See ticket details',
    ticketType,
    ticketQuantity: 1,
    orderId,
    orderTotal: 'See order confirmation',
    qrCodeUrl,
    ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/my-tickets`
  })
}

