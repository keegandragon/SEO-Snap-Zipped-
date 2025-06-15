export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

export function createResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

export function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({ 
      error,
      success: false 
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}