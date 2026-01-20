# Deployment Guide (AWS Amplify)

This guide outlines the steps to deploy the EventHub application to AWS Amplify.

## Prerequisites
- AWS Account
- GitHub Repository (pushed with latest changes)

## 1. Configure AWS Amplify

1. Log in to the **AWS Management Console** and search for **AWS Amplify**.
2. Click **Create new app** -> **Host web app**.
3. Select **GitHub** as the source code provider and click **Continue**.
4. Authorize AWS Amplify to access your GitHub account.
5. Select the repository (`EventHub-Event_Marketplace`) and branch (`main`).
6. Click **Next**.

## 2. Build Settings

Amplify should automatically detect the `amplify.yml` file in the project root.
- **App name**: EventHub
- **Framework**: Next.js - SSR

## 3. Environment Variables

Click **Advanced settings** and add the following environment variables. Copy values from your local `.env.local` file.

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (for webhooks/admin tasks) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret (Update this after deployment!) |
| `QR_SECRET_KEY` | Secret for signing QR codes |
| `NEXT_PUBLIC_APP_URL` | **Set this to your Amplify domain (e.g., https://main.d123.amplifyapp.com)** |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail App Password |
| `SMTP_FROM` | `EventHub <your-email@gmail.com>` |

**Important:**
- For `NEXT_PUBLIC_APP_URL`, use the domain provided by Amplify *after* the first deployment, or your custom domain if you set one up.
- For `STRIPE_WEBHOOK_SECRET`, you will need to create a new webhook endpoint in the Stripe Dashboard pointing to your deployed URL: `https://your-domain.com/api/webhooks/stripe`.

## 4. Deploy

1. Click **Save and deploy**.
2. Amplify will start the build process. You can monitor the progress in the console.

## 5. Post-Deployment Setup

### Stripe Webhook
1. Go to the [Stripe Developer Dashboard](https://dashboard.stripe.com/test/webhooks).
2. Add a new endpoint.
3. **Endpoint URL**: `https://<your-amplify-domain>/api/webhooks/stripe`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Reveal the **Signing Secret** (starts with `whsec_`) and update the `STRIPE_WEBHOOK_SECRET` environment variable in the Amplify Console.
6. Trigger a re-deployment in Amplify (Redeploy this version) to apply the new variable.

### Custom Domain & SSL
1. In Amplify Console, go to **Domain management**.
2. Click **Add domain**.
3. Enter your domain name and follow the verification steps (CNAME records).
4. Amplify manages SSL certificates automatically.
