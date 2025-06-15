const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

// Plan configuration
const PLAN_FEATURES = {
  free: {
    maxTags: 5,
    maxDescriptionLength: 150,
    maxImages: 1,
    features: ['Basic SEO optimization']
  },
  starter: {
    maxTags: 10,
    maxDescriptionLength: 300,
    maxImages: 5,
    features: ['Advanced SEO optimization', 'Long-form descriptions', 'Batch processing']
  },
  pro: {
    maxTags: 15,
    maxDescriptionLength: 500,
    maxImages: 10,
    features: ['Premium SEO optimization', 'Long-form descriptions', 'Advanced batch processing']
  }
};

function getPlanType(isPremium: boolean, usageLimit: number): 'free' | 'starter' | 'pro' {
  if (!isPremium) return 'free';
  if (usageLimit === 50) return 'starter';
  if (usageLimit === 200) return 'pro';
  return 'free'; // fallback
}

async function generateDescriptionForImage(imageBase64: string, planType: 'free' | 'starter' | 'pro', imageName: string = '') {
  const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!googleApiKey) {
    throw new Error('Google API key not configured. Please add GOOGLE_API_KEY to your Supabase Edge Function environment variables.');
  }

  const planConfig = PLAN_FEATURES[planType];
  
  console.log(`Processing image: ${imageName} with ${planType} plan features`);
  
  // Create plan-specific prompt
  const prompt = `You are a professional e-commerce product description writer. Analyze the provided image and create:

1. A concise but descriptive product title (max 60 characters)
2. A detailed product description highlighting key features, benefits, and unique selling points (${planConfig.maxDescriptionLength} words max)
3. Relevant SEO-optimized tags for e-commerce listings (exactly ${planConfig.maxTags} tags)

${planType === 'free' ? 'Focus on basic product features and benefits.' : ''}
${planType === 'starter' ? 'Include advanced SEO optimization with compelling marketing language.' : ''}
${planType === 'pro' ? 'Use premium SEO techniques with sophisticated marketing copy and advanced product positioning.' : ''}

Format your response exactly as follows:
Title: [product title]
Description: [detailed description - exactly ${planConfig.maxDescriptionLength} words or less]
Tags: [exactly ${planConfig.maxTags} comma-separated tags]

Make the content engaging, professional, and optimized for search engines. Focus on what makes this product unique and appealing to potential customers.`;

  // Call Google Gemini Pro Vision API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: planType === 'pro' ? 0.8 : planType === 'starter' ? 0.7 : 0.6,
        topK: 32,
        topP: 1,
        maxOutputTokens: planType === 'pro' ? 1500 : planType === 'starter' ? 1000 : 800,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`);
  }

  const completion = await response.json();
  
  // Check if the response has the expected structure
  if (!completion.candidates || completion.candidates.length === 0) {
    throw new Error('No candidates in Gemini response. The image may have been blocked by safety filters.');
  }

  const responseText = completion.candidates[0].content.parts[0].text;

  // Extract title, description, and tags from the response
  const lines = responseText.split('\n');
  let title = '';
  let description = '';
  let seoTags: string[] = [];

  let currentSection = '';
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    if (lowerLine.startsWith('title:')) {
      currentSection = 'title';
      title = line.split(':').slice(1).join(':').trim();
    } else if (lowerLine.startsWith('description:')) {
      currentSection = 'description';
      const descPart = line.split(':').slice(1).join(':').trim();
      if (descPart) description = descPart + '\n';
    } else if (lowerLine.startsWith('tags:')) {
      currentSection = 'tags';
      const tagsPart = line.split(':').slice(1).join(':').trim();
      if (tagsPart) {
        const tags = tagsPart.split(',').map(tag => tag.trim()).filter(tag => tag);
        seoTags.push(...tags);
      }
    } else if (line.trim()) {
      if (currentSection === 'description') {
        description += line.trim() + '\n';
      } else if (currentSection === 'tags') {
        const tags = line.replace(/[-•*]/g, '').trim().split(',');
        seoTags.push(...tags.map(tag => tag.trim()).filter(tag => tag));
      }
    }
  }

  // Clean up description
  description = description.trim();

  // Enforce plan limits
  seoTags = [...new Set(seoTags)].slice(0, planConfig.maxTags);
  
  // Truncate description if it exceeds word limit
  const words = description.split(' ');
  if (words.length > planConfig.maxDescriptionLength) {
    description = words.slice(0, planConfig.maxDescriptionLength).join(' ') + '...';
  }

  // Validate that we got meaningful content
  if (!title || title.length < 5) {
    throw new Error('Failed to extract a valid title from AI response');
  }
  if (!description || description.length < 50) {
    throw new Error('Failed to extract a valid description from AI response');
  }
  if (seoTags.length === 0) {
    throw new Error('Failed to extract valid SEO tags from AI response');
  }

  // Ensure we have exactly the right number of tags for the plan
  if (seoTags.length < planConfig.maxTags) {
    // If we don't have enough tags, add some generic ones based on the title
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    const additionalTags = titleWords.slice(0, planConfig.maxTags - seoTags.length);
    seoTags.push(...additionalTags);
  }

  // Final enforcement of tag limit
  seoTags = seoTags.slice(0, planConfig.maxTags);

  return {
    title,
    description,
    seoTags
  };
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
    console.log('Received request to process batch images');

    // Parse the request body
    const body = await req.json();
    const { images, userId, usageLimit, isPremium } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No images provided or invalid images array',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Determine plan type based on user data
    const planType = getPlanType(isPremium || false, usageLimit || 5);
    const planConfig = PLAN_FEATURES[planType];
    
    console.log(`Processing ${images.length} images for ${planType} plan user`);

    // Check if user's plan supports the number of images
    if (images.length > planConfig.maxImages) {
      return new Response(
        JSON.stringify({ 
          error: `Your ${planType} plan supports up to ${planConfig.maxImages} images. Please upgrade to process more images.`,
          success: false,
          maxImages: planConfig.maxImages,
          planType
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Process all images with progress tracking
    const results = [];
    const errors = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        console.log(`Processing image ${i + 1}/${images.length}: ${image.filename || 'unnamed'}`);
        
        if (!image.data) {
          throw new Error(`Image ${i + 1}: No image data provided`);
        }

        const result = await generateDescriptionForImage(
          image.data, 
          planType, 
          image.filename || `Image ${i + 1}`
        );
        
        results.push({
          index: i,
          imageId: image.id || `image_${i}`,
          imageName: image.filename || `Image ${i + 1}`,
          success: true,
          ...result
        });
        
        console.log(`Successfully processed image ${i + 1}/${images.length}`);
        
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        errors.push({
          index: i,
          imageId: image.id || `image_${i}`,
          imageName: image.filename || `Image ${i + 1}`,
          error: error.message || 'Failed to process image'
        });
      }
    }

    console.log(`Batch processing complete: ${results.length} successful, ${errors.length} failed`);

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        planType,
        planFeatures: planConfig.features,
        totalImages: images.length,
        successfulImages: results.length,
        failedImages: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('Error in process-batch function:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process batch images',
        success: false,
        details: 'Please ensure your Google AI API key is properly configured in Supabase Edge Function environment variables.'
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});