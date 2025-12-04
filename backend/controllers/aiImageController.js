import OpenAI from 'openai';
import cloudinary from '../config/cloudinary.js';

/**
 * AI Image Analysis Controller
 * Handles image analysis using OpenAI Vision API (gpt-4o-mini)
 * Now uses Cloudinary for image storage
 */

// Lazy initialize OpenAI client (will be created when needed)
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

/**
 * Analyze uploaded image of student's homework
 * @route POST /api/ai/analyze-image
 * @access Public (can be protected with auth middleware if needed)
 */
export const analyzeImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const file = req.files.image;

    // Get optional text message from user
    const userMessage = req.body.message || '';

    console.log('📷 Analyzing image:', file.name);
    if (userMessage) {
      console.log('💬 User message:', userMessage);
    }

    // Upload image to Cloudinary
    let cloudinaryResult;
    try {
      // Upload using buffer (more efficient than tempFilePath)
      cloudinaryResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.data.toString('base64')}`,
        {
          folder: 'homework_analysis',
          resource_type: 'auto',
          transformation: [
            { width: 1500, height: 1500, crop: 'limit' }
          ]
        }
      );
      
      console.log('☁️ Image uploaded to Cloudinary:', cloudinaryResult.secure_url);
    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: uploadError.message
      });
    }

    // Get OpenAI client (lazy initialization)
    const openaiClient = getOpenAIClient();

    // Create the analysis prompt with multilingual support and formatting rules
    let prompt = `You are an expert AI tutor analyzing a student's homework image.

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the EXACT SAME LANGUAGE the student uses
- Detect their language naturally from their message (if provided) or from text in the image
- Support ANY language: English, Urdu (اردو), Hindi (हिंदी), Roman Urdu, Arabic (العربية), Spanish (Español), Russian (Русский), Japanese (日本語), Chinese (中文), French (Français), etc.
- Be completely natural - don't mention language support

FORMATTING RULES (CRITICAL):
🎯 Make your response NEAT, CLEAN, and EASY TO UNDERSTAND:

a) Use **bold** for:
   - **Headings** (e.g., **What Student Attempted:** or **طالب علم نے کیا کیا:**)
   - **Key terms** and **important concepts**
   - **Formulas** and **equations**

b) Structure:
   - Short paragraphs (2-3 lines max)
   - Add line breaks between sections
   - Use bullet points (•) for lists
   - Number steps (1., 2., 3.)

c) Avoid:
   - Long paragraphs
   - Repetitive words
   - Complex sentences

Your task:
**1. What the student attempted:**
[Brief description]

**2. Correct Steps:**
• [List correct steps with bullets]
• [Be specific and encouraging]

**3. Incorrect Steps:**
• [Identify mistakes clearly]
• [Explain what went wrong]

**4. Correct Solution:**
[Show step-by-step solution with numbers]

**5. Learning Tips:**
• [Tip 1]
• [Tip 2]
• [Tip 3]

Be encouraging and supportive while being precise about corrections.`;

    // Add user's message if provided
    if (userMessage && userMessage !== '📷 Analyzing homework image...') {
      prompt += `\n\nStudent's question/message: "${userMessage}"
Please address their specific question while analyzing the image.`;
    }

    // Call OpenAI Vision API using the Cloudinary URL
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
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
                url: cloudinaryResult.secure_url
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Extract AI response
    const aiResponse = response.choices[0].message.content;

    console.log('✅ Image analysis complete');

    // Return the analysis result
    return res.status(200).json({
      success: true,
      data: {
        aiResponse: aiResponse,
        imageUrl: cloudinaryResult.secure_url,
        filename: file.name,
        cloudinaryId: cloudinaryResult.public_id,
        confidence: 'high' // Optional field
      },
      message: 'Image analyzed successfully'
    });

  } catch (error) {
    console.error('❌ Error analyzing image:', error);

    // Handle missing API key error
    if (error.message && error.message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.'
      });
    }

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        message: 'OpenAI API quota exceeded. Please check your billing.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        success: false,
        message: 'Invalid OpenAI API key'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze image',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export default { analyzeImage };
