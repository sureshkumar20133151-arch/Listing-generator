import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Ensure `GEMINI_API_KEY` is set in the environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { productName, brandName, marketplace, keywordData, regenerateSection, currentListing } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = '';

    if (regenerateSection) {
      prompt = `
You are an expert Amazon Listing Optimizer.

Your task is to REGENERATE ONLY the "${regenerateSection}" section of the following Amazon listing.
Keep the rest of the listing context in mind to ensure consistency, but DO NOT output the other sections.

Product Name: ${productName}
Brand Name: ${brandName}
Marketplace: ${marketplace}

Top Keywords:
${keywordData}

Current Listing Context:
Title: ${currentListing?.title || ''}
Bullets: ${currentListing?.bullets ? currentListing.bullets.join('\n') : ''}
Description: ${currentListing?.description || ''}
Backend Terms: ${currentListing?.backend || ''}

Rules for ${regenerateSection}:
`;
      if (regenerateSection === 'title') {
        prompt += `Title must be strictly under 200 characters. Include primary keywords naturally.\nOutput format strictly as JSON:\n{\n  "title": "..."\n}`;
      } else if (regenerateSection === 'bullets') {
        prompt += `Generate exactly 5 bullets. Each bullet MUST be strictly under 200 characters. Focus on benefits and emotional triggers.\nOutput format strictly as JSON:\n{\n  "bullets": [\n    "...",\n    "...",\n    "...",\n    "...",\n    "..."\n  ]\n}`;
      } else if (regenerateSection === 'description') {
        prompt += `Description must be under 2000 characters and highly persuasive.\nOutput format strictly as JSON:\n{\n  "description": "..."\n}`;
      } else if (regenerateSection === 'backend') {
        prompt += `Backend search terms MUST be strictly under 249 bytes, space-separated, NO COMMAS, no repetitions, no stop words.\nOutput format strictly as JSON:\n{\n  "backend": "..."\n}`;
      }
    } else {
      prompt = `
You are an expert Amazon Listing Optimizer.

Generate a high-converting Amazon listing using the provided product data and keywords.

Product Name: ${productName}
Brand Name: ${brandName}
Marketplace: ${marketplace}

Top Keywords:
${keywordData}

Rules:
1. Title must be strictly under 200 characters. Include primary keywords naturally.
2. Bullet Points: Generate exactly 5 bullets. Each bullet MUST be strictly under 200 characters. Focus on benefits and emotional triggers.
3. Description must be under 2000 characters and highly persuasive.
4. Backend search terms MUST be strictly under 249 bytes, space-separated, NO COMMAS, no repetitions, no stop words.
5. Avoid keyword stuffing. Maintain readability.

Output format strictly as JSON:
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
  "backend": "...",
  "usedKeywords": ["keyword1", "keyword2"]
}
`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const generatedListing = JSON.parse(cleanJsonString);

    // Enforce Amazon character limits strictly
    const trimText = (text: string, max: number) => text.length > max ? text.substring(0, max).trim() : text;
    const trimBytes = (text: string, maxBytes: number) => {
      let b = new Blob([text]);
      if (b.size <= maxBytes) return text;
      let trimmed = text;
      while (new Blob([trimmed]).size > maxBytes) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed.trim(); // Ensure no trailing space
    };

    if (regenerateSection) {
      if (regenerateSection === 'title') return NextResponse.json({ title: trimText(generatedListing.title || '', 200) });
      if (regenerateSection === 'bullets') return NextResponse.json({ bullets: (generatedListing.bullets || []).map((b: string) => trimText(b, 200)) });
      if (regenerateSection === 'description') return NextResponse.json({ description: trimText(generatedListing.description || '', 2000) });
      if (regenerateSection === 'backend') return NextResponse.json({ backend: trimBytes(generatedListing.backend || '', 249) });
    }

    const finalListing = {
      title: trimText(generatedListing.title || '', 200),
      bullets: (generatedListing.bullets || []).map((b: string) => trimText(b, 200)),
      description: trimText(generatedListing.description || '', 2000),
      backend: trimBytes(generatedListing.backend || '', 249),
      usedKeywords: generatedListing.usedKeywords || []
    };

    return NextResponse.json(finalListing);
  } catch (error) {
    console.error('Error generating listing:', error);
    return NextResponse.json({ error: 'Failed to generate listing.' }, { status: 500 });
  }
}
