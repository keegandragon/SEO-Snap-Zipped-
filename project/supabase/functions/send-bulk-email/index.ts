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
  createdAt: string;
}

async function sendBulkEmail(email: string, descriptions: ProductDescription[], totalCount: number) {
  // Try multiple email services in order of preference
  
  // First try Resend (recommended)
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (resendApiKey) {
    return await sendWithResend(email, descriptions, totalCount, resendApiKey);
  }
  
  // Fallback to SendGrid
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  if (sendGridApiKey) {
    return await sendWithSendGrid(email, descriptions, totalCount, sendGridApiKey);
  }
  
  // Fallback to simulation
  return await sendWithFallbackService(email, descriptions, totalCount);
}

async function sendWithResend(email: string, descriptions: ProductDescription[], totalCount: number, apiKey: string) {
  const emailContent = createBulkEmailHTML(descriptions, totalCount);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SEO Snap <noreply@seosnap.com>',
      to: [email],
      subject: `Your ${totalCount} SEO-Optimized Product Descriptions from SEO Snap`,
      html: emailContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function sendWithSendGrid(email: string, descriptions: ProductDescription[], totalCount: number, apiKey: string) {
  const emailContent = createBulkEmailHTML(descriptions, totalCount);
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: email }],
        subject: `Your ${totalCount} SEO-Optimized Product Descriptions from SEO Snap`
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

async function sendWithFallbackService(email: string, descriptions: ProductDescription[], totalCount: number) {
  // Simulate sending and log the email content
  console.log('=== BULK EMAIL CONTENT (Fallback Mode) ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Your ${totalCount} SEO-Optimized Product Descriptions from SEO Snap`);
  console.log('Content:', createBulkEmailHTML(descriptions, totalCount));
  console.log('=== END BULK EMAIL CONTENT ===');
  
  return { 
    success: true, 
    message: 'Bulk email simulated (no email service configured)',
    fallback: true 
  };
}

function createBulkEmailHTML(descriptions: ProductDescription[], totalCount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your SEO Snap Product Descriptions (${totalCount} Items)</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
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
        .summary {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .summary h2 {
            margin: 0 0 10px 0; 
            color: #1e40af;
            font-size: 22px;
        }
        .summary p {
            margin: 0; 
            font-size: 16px;
            color: #374151;
        }
        .product-item {
            background: #fafafa;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .product-number {
            background: #1e40af;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 15px;
        }
        .product-title { 
            color: #1e40af; 
            font-size: 22px; 
            margin-bottom: 15px; 
            font-weight: 600;
        }
        .description { 
            background: white; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 15px 0; 
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
            border-radius: 6px; 
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
            border-radius: 15px; 
            font-size: 12px; 
            font-weight: 500;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
            padding-top: 30px;
        }
        .footer a {
            color: #1e40af;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .divider {
            border: none;
            height: 2px;
            background: linear-gradient(to right, #1e40af, #3b82f6, #1e40af);
            margin: 40px 0;
            border-radius: 1px;
        }
        .meta-info {
            color: #6b7280;
            font-size: 12px;
            margin-top: 15px;
            text-align: right;
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
            <p>Your Complete Product Description Collection</p>
            <p style="font-size: 18px; margin-top: 15px;">${totalCount} AI-Generated Descriptions</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <h2>🎉 Batch Generation Complete!</h2>
                <p>
                    Successfully generated <strong>${totalCount} product descriptions</strong> with SEO optimization, 
                    keywords, and metadata ready for your e-commerce store.
                </p>
            </div>

            ${descriptions.map((description, index) => `
                <div class="product-item">
                    <div class="product-number">Product ${index + 1} of ${totalCount}</div>
                    <h2 class="product-title">${description.title}</h2>
                    
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
                    
                    <div class="tags">
                        <strong style="color: #374151;">🔑 Keywords:</strong><br>
                        ${description.keywords.map(keyword => `<span class="tag">${keyword}</span>`).join('')}
                    </div>

                    <div class="meta-info">
                        Generated: ${new Date(description.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                ${index < descriptions.length - 1 ? '<hr class="divider">' : ''}
            `).join('')}

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://seosnap.com" class="cta-button">Generate More Descriptions</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Generated by SEO Snap - AI-Powered Product Descriptions</strong></p>
            <p>Visit us at <a href="https://seosnap.com">seosnap.com</a></p>
            <p style="margin-top: 20px; font-size: 12px;">
                This email contains ${totalCount} product descriptions with SEO optimization.<br>
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
    console.log('Received request to send bulk email');

    // Parse the request body
    const body = await req.json();
    const { email, descriptions, totalCount } = body;

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

    if (!descriptions || !Array.isArray(descriptions) || descriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Product descriptions array is required',
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

    console.log(`Sending bulk email to: ${email} with ${descriptions.length} descriptions`);
    const result = await sendBulkEmail(email, descriptions, totalCount || descriptions.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.fallback ? 
          `Email functionality is in demo mode. Would have sent ${descriptions.length} descriptions to ${email}` :
          `Successfully sent ${descriptions.length} descriptions to ${email}`,
        totalDescriptions: descriptions.length,
        demo: result.fallback || false
      }),
      {
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('Error in send-bulk-email function:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send bulk email',
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