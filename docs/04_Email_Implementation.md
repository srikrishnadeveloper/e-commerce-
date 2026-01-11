# Order Status Email Implementation

## Overview
Dynamic order status email notifications have been implemented. All email templates now automatically adapt to your site's configuration, including company name, branding colors, and contact information.

## Features Implemented

### 1. Dynamic Email Templates
All order-related emails now use site configuration from the database:
- **Order Confirmation Email** - Sent when order is placed
- **Order Status Update Email** - Sent when order status changes
- **Shipping Notification Email** - Sent when order is shipped
- **Delivery Confirmation Email** - Sent when order is delivered
- **Order Cancellation Email** - Sent when order is cancelled

### 2. Dynamic Branding
Email templates automatically fetch and use:
- **Company Name** - Extracted from:
  1. `branding.name` (if available)
  2. Logo alt text (`branding.logo.alt`)
  3. Footer copyright text (`footer.copyright`)
  4. Fallback: "Our Store"

- **Primary Color** - From `branding.colors.primary`
- **Support Email** - From `company.contact.email` or `contact.email`
- **Company Logo** - From `branding.logo.light`

### 3. Email Triggers
Emails are automatically sent when:
- New order is created → Order Confirmation Email
- Order status updated → Status Update Email
- Order status = "shipped" → Shipping Notification Email
- Order status = "delivered" → Delivery Confirmation Email
- Order status = "cancelled" → Cancellation Email

## Technical Details

### Updated File
- `backend/src/utils/orderEmails.js` - All 5 email functions updated

### New Helper Function
```javascript
getSiteBranding() - Fetches site config and extracts branding info
```

### Email Template Structure
Each email now includes:
1. **Professional Header** - Company name with gradient background using brand colors
2. **Order Details** - Order number, status, total, tracking info
3. **Personalized Content** - User name, relevant information
4. **Branded Footer** - Company name, year, user email

### Fallback System
If site config cannot be fetched or fields are missing:
- Company Name: "Our Store"
- Primary Color: "#3b82f6" (blue)
- Support Email: "support@store.com"

## How to Update Branding

### Option 1: Update Site Config via API
```javascript
// Update branding section
PUT /api/siteconfig/all
{
  "branding": {
    "name": "Your Company Name",  // Add this field
    "logo": { ... },
    "colors": { 
      "primary": "#your-color" 
    }
  }
}
```

### Option 2: Update Footer Copyright
The system will extract company name from copyright text:
```javascript
{
  "footer": {
    "copyright": "© 2024 Your Company Name. All Rights Reserved."
  }
}
```

### Option 3: Update Logo Alt Text
```javascript
{
  "branding": {
    "logo": {
      "alt": "Your Company Name Logo"
    }
  }
}
```

## Testing

To test email functionality:
1. Ensure backend server is running
2. Create a test order through the frontend
3. Update order status via admin dashboard
4. Check email inbox for notification

### Test Email Configuration
Verify these environment variables in `backend/config.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Your Company Name
```

## Benefits

1. **No Hardcoded Values** - All branding is dynamic
2. **Automatic Updates** - Change site config once, all emails update
3. **Professional Design** - Clean, modern email templates
4. **Brand Consistency** - Uses your actual company name and colors
5. **Multi-tenant Ready** - Perfect for white-label or multi-store setups

## Email Preview

All emails now follow this structure:
```
┌─────────────────────────────────┐
│ [Your Company Name]             │ ← Gradient header with brand color
│ Order Confirmation              │
├─────────────────────────────────┤
│ Hi [Customer Name],             │
│                                 │
│ [Email Content]                 │
│                                 │
│ ┌───────────────────────────┐  │
│ │ Order Details             │  │
│ │ Order #: 12345678         │  │
│ │ Status: Processing        │  │
│ │ Total: $99.99            │  │
│ └───────────────────────────┘  │
│                                 │
│ Thank you for choosing          │
│ [Your Company Name]!            │
├─────────────────────────────────┤
│ © 2024 [Your Company Name]     │ ← Dynamic footer
│ All rights reserved.            │
└─────────────────────────────────┘
```

## Next Steps

1. ✅ Dynamic email templates implemented
2. ✅ Site config integration complete
3. ✅ Fallback system in place
4. 📋 Optional: Add company logo to email headers
5. 📋 Optional: Add email preview/test endpoint
6. 📋 Optional: Add email templates for other notifications

## Notes
- Email sending uses existing `sendEmail` utility in `backend/src/utils/email.js`
- All emails are HTML formatted with inline styles for maximum compatibility
- Mobile-responsive design with max-width 600px
- Graceful fallback if site config is unavailable
