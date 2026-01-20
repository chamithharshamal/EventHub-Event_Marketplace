import nodemailer from 'nodemailer'

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

export function generateTicketEmailHtml(eventTitle: string, ticketType: string, qrCodeUrl: string, orderId: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .ticket-info { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .qr-code { text-align: center; margin: 20px 0; }
        .qr-code img { max-width: 200px; height: auto; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Ticket is Here!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Thank you for your purchase! Here is your ticket for <strong>${eventTitle}</strong>.</p>
          
          <div class="ticket-info"> // Corrected line
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Ticket Type:</strong> ${ticketType}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
          </div>

          <div class="qr-code">
            <p>Scan this code at the entrance:</p>
            <img src="${qrCodeUrl}" alt="Ticket QR Code" />
          </div>

          <p>You can also view your tickets in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-tickets">dashboard</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EventHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
