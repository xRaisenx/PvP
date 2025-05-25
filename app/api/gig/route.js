// app/api/gig/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { service } = await req.json();
    if (!service || typeof service !== 'string' || service.trim() === '') {
      return NextResponse.json({ error: "Service description is required and must be a non-empty string." }, { status: 400 });
    }
    const prompt = `Generate a Fiverr gig description for a service offering "${service}". Highlight skills in AI, web development, and digital marketing. Include a compelling title, description, and pricing starting at $199. Format as JSON: {"title": "...", "description": "...", "pricing": "..."}`;
    const fakeGeminiReply = {
        title: `AI-Powered ${service.substring(0,30)} Service`,
        description: `Get a professional ${service} solution leveraging AI, web development, and digital marketing. Includes setup, testing, and 1-month support.`,
        pricing: "Starting at $199"
    };
    if (prisma) {
      await prisma.gig.create({
        data: { service, gig: JSON.stringify(fakeGeminiReply) },
      });
    }
    return NextResponse.json({ gig: fakeGeminiReply });
  } catch (error) {
    console.error("Error in gig route:", error);
    return NextResponse.json({ error: "Failed to generate gig: " + error.message }, { status: 500 });
  }
}
