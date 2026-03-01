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
You are an Amazon SEO Listing Expert.

Your task is to generate a high-converting Amazon listing using the provided keywords.

Please analyze the provided Keyword Data and internally categorize them by search volume and relevance into:
- PRIMARY KEYWORDS (MUST appear naturally in the Title)
- SECONDARY KEYWORDS (Use across bullets strategically)
- SUPPORT KEYWORDS (Use where relevant without keyword stuffing)

Product Name: ${productName}
Brand Name: ${brandName}
Marketplace: ${marketplace}

Keyword Data:
${keywordData}

Rules:
1. ALL primary keywords MUST be included in the Title naturally.
2. Do not repeat the same keyword phrase unnecessarily.
3. Avoid keyword stuffing.
4. Maintain readability and persuasive tone.
5. Follow Amazon best practices.
6. Title must be under 200 characters.
7. Each bullet must be under 250 characters.
8. Generate 5 bullet points.
9. Include emotional triggers and benefit-driven language.
10. Keep it conversion-focused.

Output format strictly as JSON, matching the following structure exactly (do not output any other text or markdown blocks):
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
`;

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
