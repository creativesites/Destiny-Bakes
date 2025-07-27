const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Grok API configuration
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY;

async function analyzeImageWithGrok(imagePath, fileName) {
  try {
    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = `Analyze this cake image and provide detailed information in JSON format. The image filename is "${fileName}". 

Please extract the following information:
{
  "name": "Descriptive cake name",
  "description": "Detailed description of the cake including flavors, decorations, and style",
  "category": "One of: Birthday, Wedding, Celebration, Custom, Anniversary, Baby Shower, Graduation",
  "difficulty_level": "1-5 scale (1=simple, 5=very complex)",
  "estimated_price": "Estimated price in USD",
  "colors": ["primary", "secondary", "accent colors"],
  "decorative_elements": ["list of decorative elements visible"],
  "cake_shape": "round/square/heart/custom",
  "tiers": "number of tiers/layers",
  "size_estimate": "small/medium/large",
  "occasion_suitable": ["list of suitable occasions"],
  "style": "modern/classic/elegant/fun/rustic/minimalist",
  "special_features": ["unique elements that make this cake special"]
}

Focus on accuracy and detail. If you're unsure about something, make a reasonable inference based on visual cues.`;

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-vision-beta',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    
    // Parse JSON from the response
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Grok response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error analyzing image ${fileName}:`, error);
    return null;
  }
}

async function saveCakeToDatabase(analysis, imagePath, fileName) {
  try {
    // Upload image to Supabase storage
    const imageBuffer = fs.readFileSync(imagePath);
    const storageFileName = `catalogue/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cake-images')
      .upload(storageFileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cake-images')
      .getPublicUrl(storageFileName);

    // Insert cake data into database
    const { data, error } = await supabase
      .from('cakes')
      .insert({
        name: analysis.name,
        description: analysis.description,
        base_price: analysis.estimated_price || 50.00,
        category: analysis.category,
        images: [publicUrl],
        ingredients: {
          style: analysis.style,
          colors: analysis.colors,
          decorative_elements: analysis.decorative_elements,
          special_features: analysis.special_features
        },
        difficulty_level: analysis.difficulty_level || 3,
        featured: true,
        available: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting cake:', error);
      return null;
    }

    console.log(`Successfully saved cake: ${analysis.name}`);
    return data;
  } catch (error) {
    console.error(`Error saving cake ${fileName}:`, error);
    return null;
  }
}

async function processAllCatalogueImages() {
  const cataloguePath = path.join(__dirname, '../public/images/catalogue');
  
  if (!fs.existsSync(cataloguePath)) {
    console.error('Catalogue directory not found');
    return;
  }

  const imageFiles = fs.readdirSync(cataloguePath)
    .filter(file => file.match(/\.(jpg|jpeg|png)$/i));

  console.log(`Found ${imageFiles.length} images to process`);

  for (const fileName of imageFiles) {
    const imagePath = path.join(cataloguePath, fileName);
    console.log(`Processing ${fileName}...`);
    
    // Check if cake already exists in database
    const { data: existingCake } = await supabase
      .from('cakes')
      .select('id')
      .like('images', `%${fileName}%`)
      .single();

    if (existingCake) {
      console.log(`Cake with image ${fileName} already exists, skipping...`);
      continue;
    }

    const analysis = await analyzeImageWithGrok(imagePath, fileName);
    
    if (analysis) {
      await saveCakeToDatabase(analysis, imagePath, fileName);
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('Finished processing all catalogue images');
}

// Run the script
if (require.main === module) {
  processAllCatalogueImages()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { analyzeImageWithGrok, saveCakeToDatabase, processAllCatalogueImages };