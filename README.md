# 🎫 EventHub - Event Marketplace & Ticketing Platform

A modern, full-stack event marketplace and ticketing platform built with Next.js 14, Supabase, and TypeScript. EventHub enables event organizers to create, manage, and sell tickets for their events while providing attendees with a seamless ticket purchasing experience.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

## ✨ Features

### For Attendees
- 🔍 **Event Discovery** - Browse and search events by category, date, or location
- 🎟️ **Ticket Purchasing** - Secure checkout with Stripe integration
- 📱 **QR Code Tickets** - Unique QR codes for easy event check-in
- 📧 **Email Confirmations** - Professional HTML email receipts

### For Organizers
- 📝 **Event Creation** - Rich event editor with image uploads and ticket tiers
- 📊 **Analytics Dashboard** - Real-time sales and attendance insights
- 👥 **Attendee Management** - View and manage ticket holders
- 💰 **Order Tracking** - Complete order history and revenue reports

### For Administrators
- ✅ **Event Approval System** - Review and approve events before publication
- 📈 **Platform Statistics** - Monitor overall platform activity
- 🛡️ **Content Moderation** - Reject inappropriate events with feedback

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Styling** | Tailwind CSS |
| **UI Components** | Radix UI + shadcn/ui |
| **Payments** | Stripe |
| **Email** | Nodemailer |
| **QR Codes** | qrcode library |
| **File Storage** | Supabase Storage |

## 📁 Project Structure

```
event-marketplace/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login & Register pages
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── admin/        # Admin dashboard & moderation
│   │   │   └── dashboard/    # Organizer dashboard
│   │   ├── (public)/         # Public pages (events, features, etc.)
│   │   ├── api/              # API routes
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── checkout/         # Checkout components
│   │   ├── events/           # Event-related components
│   │   ├── layout/           # Header, Footer, Sidebar
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── supabase/         # Supabase client configuration
│   │   ├── email.ts          # Email service
│   │   ├── email-templates.ts # HTML email templates
│   │   └── stripe.ts         # Stripe configuration
│   └── types/                # TypeScript type definitions
├── supabase/
│   └── migrations/           # Database migration files
└── public/                   # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)
- SMTP server (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/event-marketplace.git
   cd event-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Email (SMTP)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   EMAIL_FROM=noreply@yourdomain.com

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the migrations in your Supabase SQL Editor in order:
   ```
   001_initial_schema.sql
   002_storage.sql
   003_functions.sql
   004_rls_policies.sql
   005_admin_approval.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

### Setting Up an Admin User

After creating an account, promote yourself to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 📄 Pages

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/events` | Event listing |
| `/events/[slug]` | Event details |
| `/features` | Platform features |
| `/pricing` | Pricing plans |
| `/organizers` | For organizers |
| `/about` | About us |
| `/blog` | Blog articles |
| `/careers` | Job openings |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/cookies` | Cookie policy |

### Dashboard Pages
| Route | Description |
|-------|-------------|
| `/dashboard` | Organizer overview |
| `/dashboard/events` | Manage events |
| `/dashboard/events/new` | Create new event |
| `/dashboard/orders` | View orders |
| `/dashboard/attendees` | Manage attendees |
| `/dashboard/analytics` | Analytics dashboard |
| `/dashboard/settings` | Account settings |

### Admin Pages
| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard |
| `/admin/events` | Event moderation |

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Admin Service Role** - Secure admin operations bypassing RLS
- **Secure QR Codes** - Unique, non-guessable ticket identifiers
- **Stripe Webhooks** - Verified payment confirmations

## 📧 Email Templates

The platform includes professional HTML email templates for:
- ✅ Ticket confirmation
- ✅ Event approval notification
- ✅ Event rejection notification
- ✅ Welcome email

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/event-marketplace)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Stripe](https://stripe.com/) - Payment Processing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS

---

<p align="center">
  Made with ❤️ for event organizers and attendees everywhere
</p>
