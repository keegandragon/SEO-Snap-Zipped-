# Email Service Setup Guide

The email functionality is currently in **demo mode** because no email service is configured. Here's how to set up real email sending:

## Option 1: Resend (Recommended - Free Tier Available)

### 1. Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Create a free account (100 emails/day free)
3. Verify your email address

### 2. Get API Key
1. Go to your Resend dashboard
2. Navigate to "API Keys"
3. Click "Create API Key"
4. Copy the API key (starts with `re_`)

### 3. Add to Supabase
1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions" → "Settings"
3. Add environment variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key

### 4. Verify Domain (Optional but Recommended)
1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `seosnap.com`)
3. Follow DNS verification steps
4. Update the `from` field in the email functions to use your domain

## Option 2: SendGrid (Alternative)

### 1. Sign up for SendGrid
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create a free account (100 emails/day free)

### 2. Get API Key
1. Go to Settings → API Keys
2. Create a new API key with "Full Access"
3. Copy the API key

### 3. Add to Supabase
1. Add environment variable:
   - **Name:** `SENDGRID_API_KEY`
   - **Value:** Your SendGrid API key

## Current Behavior (Demo Mode)

Without email service configuration:
- ✅ Email form validation works
- ✅ Success message is shown
- ✅ Email content is generated and logged
- ❌ **No actual email is sent**

## After Setup

Once you add an email service API key:
- ✅ Real emails will be sent
- ✅ Professional HTML formatting
- ✅ Proper sender information
- ✅ Error handling for failed sends

## Testing

After setup, test with:
1. Generate a product description
2. Click "Email" button
3. Enter your email address
4. Check your inbox for the formatted email

## Troubleshooting

### Common Issues:
1. **"Email service not configured"** - Add API key to Supabase environment variables
2. **"Invalid API key"** - Check the API key is correct and has proper permissions
3. **"Domain not verified"** - Use default domain or verify your custom domain

### Debug Steps:
1. Check Supabase Edge Function logs
2. Verify environment variables are set
3. Test with a simple email first
4. Check spam folder

## Production Recommendations

1. **Use a custom domain** for professional appearance
2. **Set up SPF/DKIM records** to improve deliverability
3. **Monitor email metrics** in your email service dashboard
4. **Implement rate limiting** to prevent abuse
5. **Add unsubscribe links** for compliance

## Cost Estimates

- **Resend:** 100 emails/day free, then $20/month for 50k emails
- **SendGrid:** 100 emails/day free, then $19.95/month for 50k emails

Both services are very affordable for most use cases.