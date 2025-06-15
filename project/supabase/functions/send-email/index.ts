const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

interface ProductDescription {
  id: string;
  title: string;
  text: string;
  keywords: string[];
  seoMetadata: {
    title: string;
    description: string;
    tags: string[];
  };
}

async function sendEmail(email: string, description: ProductDescription) {
  // Try multiple email services in order of preference
  
  // First try Resend (recommended)
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (resendApiKey) {
    return await sendWithResend(email, description, resendApiKey);
  }
  
  // Fallback to SendGrid
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  if (sendGridApiKey) {
    return await sendWithSendGrid(email, description, sendGridApiKey);
  }
  
  // Fallback to a simple SMTP service (using Resend's free tier)
  return await sendWithFallbackService(email, description);
}

async function sendWithResend(email: string, description: ProductDescription, apiKey: string) {
  const emailContent = createEmailHTML(description);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SEO Snap <noreply@seosnap.com>',
      to: [email],
      subject: `Your Product Description: ${description.title}`,
      html: emailContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function sendWithSendGrid(email: string, description: ProductDescription, apiKey: string) {
  const emailContent = createEmailHTML(description);
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: email }],
        subject: `Your Product Description: ${description.title}`
      }],
      from: { email: 'noreply@seosnap.com', name: 'SEO Snap' },
      content: [{
        type: 'text/html',
        value: emailContent
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  return { success: true };
}

async function sendWithFallbackService(email: string, description: ProductDescription) {
  // Use a free email service as fallback (EmailJS or similar)
  // For now, we'll simulate sending and log the email content
  console.log('=== EMAIL CONTENT (Fallback Mode) ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Your Product Description: ${description.title}`);
  console.log('Content:', createEmailHTML(description));
  console.log('=== END EMAIL CONTENT ===');
  
  // In a real implementation, you could use EmailJS or another service here
  // For now, we'll return success but note that it's a simulation
  return { 
    success: true, 
    message: 'Email simulated (no email service configured)',
    fallback: true 
  };
}

function createEmailHTML(description: ProductDescription): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your SEO Snap Product Description</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content { 
            padding: 30px; 
        }
        .title { 
            color: #1e40af; 
            font-size: 24px; 
            margin-bottom: 20px; 
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .description { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #1e40af; 
            line-height: 1.7;
        }
        .description h3 {
            margin-top: 0;
            color: #374151;
            font-size: 16px;
            font-weight: 600;
        }
        .seo-section { 
            background: #f0f9ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 1px solid #bae6fd;
        }
        .seo-title { 
            font-weight: 600; 
            color: #0c4a6e; 
            margin-bottom: 8px; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .tags { 
            margin: 15px 0; 
        }
        .tag { 
            display: inline-block; 
            background: #dbeafe; 
            color: #1e40af; 
            padding: 6px 12px; 
            margin: 3px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 500;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .footer a {
            color: #1e40af;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .cta-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📸 SEO Snap</h1>
            <p>Your AI-Generated Product Description</p>
        </div>
        
        <div class="content">
            <h2 class="title">${description.title}</h2>
            
            <div class="description">
                <h3>📝 Product Description:</h3>
                <p>${description.text.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="seo-section">
                <div class="seo-title">🎯 SEO Title:</div>
                <p style="margin: 0 0 15px 0; font-weight: 500;">${description.seoMetadata.title}</p>
                
                <div class="seo-title">📄 Meta Description:</div>
                <p style="margin: 0 0 15px 0;">${description.seoMetadata.description}</p>
                
                <div class="seo-title">🏷️ SEO Tags:</div>
                <div class="tags">
                    ${description.seoMetadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <strong style="color: #374151;">🔑 Keywords:</strong><br>
                <div class="tags">
                    ${description.keywords.map(keyword => `<span class="tag">${keyword}</span>`).join('')}
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://seosnap.com" class="cta-button">Generate More Descriptions</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Generated by SEO Snap - AI-Powered Product Descriptions</strong></p>
            <p>Visit us at <a href="https://seosnap.com">seosnap.com</a></p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                This email was sent because you requested a product description from SEO Snap.<br>
                Copy and paste the content directly into your e-commerce platform.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Received request to send email');

    // Parse the request body
    const body = await req.json();
    const { email, description } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'Email address is required',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    if (!description) {
      return new Response(
        JSON.stringify({ 
          error: 'Product description is required',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email address format',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log('Sending email to:', email);
    const result = await sendEmail(email, description);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.fallback ? 
          'Email functionality is in demo mode. In production, this would send a real email.' :
          'Email sent successfully',
        demo: result.fallback || false
      }),
      {
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send email',
        success: false,
        details: 'Email service configuration needed. Contact support for assistance.'
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});