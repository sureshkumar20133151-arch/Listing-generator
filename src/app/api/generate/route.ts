import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Ensure `GEMINI_API_KEY` is set in the environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { productName, brandName, marketplace, keywordData } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert Amazon SEO listing copywriter.

Your job is to generate HIGH-CONVERTING, SEO-OPTIMIZED product listings that rank on first page.

Rules:
- Prioritize high search volume keywords.
- Use keywords naturally without stuffing.
- Follow Amazon SEO best practices.
- Make content benefit-driven, not keyword-dumped.
- Maintain readability and persuasive tone.
- Do not repeat the same keyword excessively.
- Follow exact character limits.

SEO Strategy:
- Primary keyword must appear in Title.
- Secondary keywords in Bullets.
- Remaining keywords in Description and Backend.
- Avoid duplicate words in backend search terms.
- No punctuation in backend search terms.
- Backend terms must be lowercase only.

Tone:
Professional, conversion-focused, marketplace optimized. 

Generate a fully optimized Amazon product listing using the data below.

Product Name:
${productName}

Brand Name:
${brandName}

Marketplace:
${marketplace}

Keyword Data:
${keywordData}

Instructions:

Step 1:
Identify top 5 primary keywords based on highest search volume.
If no search volume data available, select the most relevant 5 keywords.

Step 2:
Create:

1) TITLE
- Maximum 200 characters
- Start with strongest primary keyword
- Include 3–5 high-value keywords
- Make it readable and conversion-focused

2) 5 BULLET POINTS
- Exactly 5
- 150–200 characters each
- Focus on benefits
- Integrate secondary keywords naturally
- Avoid repetition

3) PRODUCT DESCRIPTION
- 1000–1500 characters
- Persuasive tone
- Use remaining keywords
- Natural flow
- No keyword stuffing

4) BACKEND SEARCH TERMS
- Max 250 bytes
- Lowercase only
- No punctuation
- No repeated words
- Use unused keywords

Output format strictly as JSON, matching the following structure:
{
  "title": "...",
  "bullets": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "description": "...",
  "backend": "..."
}

Before generating output, internally cluster keywords by relevance and buyer intent, then distribute them strategically across Title, Bullets, Description, and Backend. Ensure at least 80% of top 10 highest volume keywords are used naturally in the listing. Return ONLY the raw JSON object. Do not include markdown blocks like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up potential markdown formatting from the response
    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const generatedListing = JSON.parse(cleanJsonString);

    return NextResponse.json(generatedListing);
  } catch (error) {
    console.error('Error generating listing:', error);
    return NextResponse.json({ error: 'Failed to generate listing.' }, { status: 500 });
  }
}
