// Email Templates for EventHub
// Professional, responsive HTML email templates

const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1e293b;
    background-color: #f1f5f9;
  }
  .wrapper {
    width: 100%;
    background-color: #f1f5f9;
    padding: 40px 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }
  .header {
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    padding: 40px 30px;
    text-align: center;
  }
  .header-logo {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    letter-spacing: -0.5px;
  }
  .header-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
    margin: 8px 0 0 0;
  }
  .content {
    padding: 40px 30px;
  }
  .greeting {
    font-size: 24px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 20px 0;
  }
  .text {
    font-size: 16px;
    color: #475569;
    margin: 0 0 16px 0;
  }
  .card {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
  }
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 16px 0;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-size: 14px;
    color: #64748b;
  }
  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
  .qr-container {
    text-align: center;
    padding: 30px;
    background-color: #ffffff;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    margin: 24px 0;
  }
  .qr-code {
    width: 180px;
    height: 180px;
    border-radius: 8px;
  }
  .qr-text {
    font-size: 14px;
    color: #64748b;
    margin: 16px 0 0 0;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    color: #ffffff !important;
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    margin: 24px 0;
  }
  .button-secondary {
    background: #f1f5f9;
    color: #475569 !important;
    border: 1px solid #e2e8f0;
  }
  .footer {
    background-color: #f8fafc;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }
  .footer-text {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
  }
  .footer-links {
    margin: 16px 0 0 0;
  }
  .footer-link {
    font-size: 12px;
    color: #7c3aed;
    text-decoration: none;
    margin: 0 12px;
  }
  .divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 24px 0;
  }
  .status-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }
  .status-approved {
    background-color: #dcfce7;
    color: #16a34a;
  }
  .status-rejected {
    background-color: #fee2e2;
    color: #dc2626;
  }
  .status-pending {
    background-color: #fef3c7;
    color: #d97706;
  }
  .highlight-box {
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    margin: 24px 0;
  }
  .highlight-title {
    font-size: 14px;
    opacity: 0.9;
    margin: 0 0 8px 0;
  }
  .highlight-value {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
  }
`

function wrapInLayout(content: string, preheader?: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>EventHub</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    ${content}
  </div>
</body>
</html>
`
}

// =============================================
// TICKET CONFIRMATION EMAIL
// =============================================
interface TicketEmailParams {
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
    ticketUrl: string
}

export function generateTicketConfirmationEmail(params: TicketEmailParams): string {
    const content = `
    <div class="container">
      <div class="header">
        <h1 class="header-logo">🎟️ EventHub</h1>
        <p class="header-subtitle">Your tickets are confirmed!</p>
      </div>
      
      <div class="content">
        <h2 class="greeting">Hi ${params.customerName}! 🎉</h2>
        <p class="text">
          Great news! Your tickets for <strong>${params.eventTitle}</strong> have been confirmed. 
          Get ready for an amazing experience!
        </p>
        
        <div class="card">
          <h3 class="card-title">📅 Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Event</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.eventTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Date</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.eventDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Time</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.eventTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #64748b; font-size: 14px;">Location</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.eventLocation}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="card">
          <h3 class="card-title">🎫 Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Ticket Type</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.ticketType}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Quantity</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.ticketQuantity}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Order ID</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                <span style="font-weight: 600; font-size: 14px;">${params.orderId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #64748b; font-size: 14px;">Total Paid</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="font-weight: 700; font-size: 18px; color: #7c3aed;">${params.orderTotal}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="qr-container">
          <img src="${params.qrCodeUrl}" alt="Ticket QR Code" class="qr-code">
          <p class="qr-text">📱 Show this QR code at the entrance for quick check-in</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${params.ticketUrl}" class="button">View My Tickets</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px; color: #94a3b8; text-align: center;">
          Need help? Reply to this email or visit our help center.
        </p>
      </div>
      
      <div class="footer">
        <p class="footer-text">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
        <div class="footer-links">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="footer-link">Visit Website</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-tickets" class="footer-link">My Tickets</a>
        </div>
      </div>
    </div>
    `

    return wrapInLayout(content, `Your tickets for ${params.eventTitle} are confirmed!`)
}

// =============================================
// EVENT APPROVED EMAIL (Organizer)
// =============================================
interface EventApprovedEmailParams {
    organizerName: string
    eventTitle: string
    eventSlug: string
}

export function generateEventApprovedEmail(params: EventApprovedEmailParams): string {
    const content = `
    <div class="container">
      <div class="header">
        <h1 class="header-logo">🎉 EventHub</h1>
        <p class="header-subtitle">Your event has been approved!</p>
      </div>
      
      <div class="content">
        <h2 class="greeting">Congratulations, ${params.organizerName}!</h2>
        
        <div class="highlight-box">
          <p class="highlight-title">Event Status</p>
          <p class="highlight-value">✅ Approved</p>
        </div>
        
        <p class="text">
          Great news! Your event <strong>"${params.eventTitle}"</strong> has been reviewed and approved 
          by our team. It's now live and visible to attendees on EventHub.
        </p>
        
        <div class="card">
          <h3 class="card-title">🚀 What's Next?</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">1. Share your event link with your audience</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">2. Monitor ticket sales in your dashboard</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="font-size: 14px;">3. Prepare for check-in on event day</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events/${params.eventSlug}" class="button">View Live Event</a>
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events" class="button button-secondary">
            Manage Event
          </a>
        </div>
      </div>
      
      <div class="footer">
        <p class="footer-text">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
      </div>
    </div>
    `

    return wrapInLayout(content, `Your event "${params.eventTitle}" has been approved!`)
}

// =============================================
// EVENT REJECTED EMAIL (Organizer)
// =============================================
interface EventRejectedEmailParams {
    organizerName: string
    eventTitle: string
    rejectionReason: string
}

export function generateEventRejectedEmail(params: EventRejectedEmailParams): string {
    const content = `
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
        <h1 class="header-logo">EventHub</h1>
        <p class="header-subtitle">Event Review Update</p>
      </div>
      
      <div class="content">
        <h2 class="greeting">Hi ${params.organizerName},</h2>
        
        <p class="text">
          We've reviewed your event <strong>"${params.eventTitle}"</strong> and unfortunately, 
          it hasn't been approved at this time.
        </p>
        
        <div class="card" style="border-color: #fecaca; background: #fef2f2;">
          <h3 class="card-title" style="color: #dc2626;">📝 Reason</h3>
          <p class="text" style="margin: 0; color: #991b1b;">
            ${params.rejectionReason}
          </p>
        </div>
        
        <p class="text">
          Don't worry! You can update your event and resubmit it for review. 
          Here are some tips to get approved:
        </p>
        
        <div class="card">
          <h3 class="card-title">💡 Tips for Approval</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">✓ Add a detailed event description</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">✓ Upload a high-quality banner image</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">✓ Ensure accurate date and location</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="font-size: 14px;">✓ Set reasonable ticket prices</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events" class="button">Edit & Resubmit</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px; color: #94a3b8; text-align: center;">
          Have questions? Reply to this email and our team will help you.
        </p>
      </div>
      
      <div class="footer">
        <p class="footer-text">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
      </div>
    </div>
    `

    return wrapInLayout(content, `Update on your event "${params.eventTitle}"`)
}

// =============================================
// WELCOME EMAIL
// =============================================
interface WelcomeEmailParams {
    userName: string
}

export function generateWelcomeEmail(params: WelcomeEmailParams): string {
    const content = `
    <div class="container">
      <div class="header">
        <h1 class="header-logo">🎉 EventHub</h1>
        <p class="header-subtitle">Welcome to the community!</p>
      </div>
      
      <div class="content">
        <h2 class="greeting">Welcome, ${params.userName}! 👋</h2>
        
        <p class="text">
          Thanks for joining EventHub! We're thrilled to have you as part of our community 
          of event enthusiasts.
        </p>
        
        <div class="card">
          <h3 class="card-title">🌟 What You Can Do</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">🎫 <strong>Discover Events</strong> - Find amazing experiences near you</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">🎟️ <strong>Buy Tickets</strong> - Secure your spot with easy checkout</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 14px;">📅 <strong>Create Events</strong> - Host your own events and sell tickets</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="font-size: 14px;">📊 <strong>Track Sales</strong> - Monitor your event performance</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" class="button">Explore Events</a>
        </div>
      </div>
      
      <div class="footer">
        <p class="footer-text">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
        <div class="footer-links">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="footer-link">Visit Website</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="footer-link">Dashboard</a>
        </div>
      </div>
    </div>
    `

    return wrapInLayout(content, `Welcome to EventHub, ${params.userName}!`)
}
