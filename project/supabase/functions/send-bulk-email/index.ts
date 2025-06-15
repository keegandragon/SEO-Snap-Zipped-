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
  // For now, we'll use a simple email service like Resend
  // You can also use SendGrid, Mailgun, or other services
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('Email service not configured. Please add RESEND_API_KEY to your Supabase Edge Function environment variables.');
  }

  // Create comprehensive email content with all descriptions
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your SEO Snap Product Descriptions (${totalCount} Items)</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: #1e40af; 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
        }
        .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 8px 8px; 
        }
        .summary {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .product-item {
            background: white;
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
            font-weight: bold;
        }
        .description { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border-left: 4px solid #1e40af; 
            line-height: 1.7;
        }
        .seo-section { 
            background: #f0f9ff; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border: 1px solid #bae6fd;
        }
        .seo-title { 
            font-weight: bold; 
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
    </style>
</head>
<body>
    <div class="header">
        <h1>📸 SEO Snap</h1>
        <p>Your Complete Product Description Collection</p>
        <p style="font-size: 18px; margin-top: 15px;">${totalCount} AI-Generated Descriptions</p>
    </div>
    
    <div class="content">
        <div class="summary">
            <h2 style="margin: 0 0 10px 0; color: #1e40af;">Batch Generation Complete!</h2>
            <p style="margin: 0; font-size: 16px;">
                Successfully generated <strong>${totalCount} product descriptions</strong> with SEO optimization, 
                keywords, and metadata ready for your e-commerce store.
            </p>
        </div>

        ${descriptions.map((description, index) => `
            <div class="product-item">
                <div class="product-number">Product ${index + 1} of ${totalCount}</div>
                <h2 class="product-title">${description.title}</h2>
                
                <div class="description">
                    <h3 style="margin-top: 0; color: #374151;">Product Description:</h3>
                    <p style="margin-bottom: 0;">${description.text.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div class="seo-section">
                    <div class="seo-title">SEO Title:</div>
                    <p style="margin: 0 0 15px 0; font-weight: 500;">${description.seoMetadata.title}</p>
                    
                    <div class="seo-title">Meta Description:</div>
                    <p style="margin: 0 0 15px 0;">${description.seoMetadata.description}</p>
                    
                    <div class="seo-title">SEO Tags:</div>
                    <div class="tags">
                        ${description.seoMetadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="tags">
                    <strong style="color: #374151;">Keywords:</strong><br>
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
    </div>
    
    <div class="footer">
        <p><strong>Generated by SEO Snap - AI-Powered Product Descriptions</strong></p>
        <p>Visit us at <a href="https://seosnap.com" style="color: #1e40af;">seosnap.com</a></p>
        <p style="margin-top: 20px; font-size: 12px;">
            This email contains ${totalCount} product descriptions with SEO optimization.<br>
            Copy and paste the content directly into your e-commerce platform.
        </p>
    </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
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
    throw new Error(`Email service error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
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
    await sendBulkEmail(email, descriptions, totalCount || descriptions.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${descriptions.length} descriptions to ${email}`,
        totalDescriptions: descriptions.length
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
        details: 'Please ensure your email service is properly configured in Supabase Edge Function environment variables.'
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});