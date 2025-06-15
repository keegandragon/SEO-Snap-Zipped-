import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

// Mock API key validation (in production, this would check against stored API keys)
const isValidApiKey = (apiKey: string) => {
  return apiKey && apiKey.startsWith('sk_');
};

Deno.serve(async (req) => {
  // Only handle requests to /api/* endpoints
  const url = new URL(req.url);
  if (!url.pathname.startsWith('/api/')) {
    console.log('Not an API route, skipping...');
    return new Response(null, { status: 404 });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Check for API key
  const apiKey = req.headers.get('X-API-Key');
  if (!isValidApiKey(apiKey)) {
    return new Response(
      JSON.stringify({ 
        error: 'Invalid or missing API key',
        docs: 'https://docs.seosnap.com/api'
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  const endpoint = url.pathname.split('/').pop();
  console.log('API endpoint requested:', endpoint);

  try {
    switch (endpoint) {
      case 'generate':
        const { image } = await req.json();
        if (!image) {
          throw new Error('Image is required');
        }
        
        // Use the same mock response as the UI for now
        return new Response(
          JSON.stringify({
            success: true,
            title: "Professional DSLR Camera with 24-70mm Lens",
            description: "Capture stunning moments with this professional-grade DSLR camera...",
            seo_tags: [
              "professional dslr camera",
              "24-70mm lens",
              "photography equipment",
              "digital camera",
              "professional photography"
            ]
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );

      case 'usage':
        // Return mock usage statistics
        return new Response(
          JSON.stringify({
            success: true,
            total_generations: 150,
            remaining_generations: 50,
            plan: 'pro'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );

      default:
        return new Response(
          JSON.stringify({
            error: 'Invalid endpoint',
            success: false,
            available_endpoints: ['/api/generate', '/api/usage'],
            docs: 'https://docs.seosnap.com/api'
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
    }
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        docs: 'https://docs.seosnap.com/api'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});