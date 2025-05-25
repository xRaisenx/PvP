// app/api/proposal/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { title, description } = await req.json();
    if (!title || !description || typeof title !== 'string' || typeof description !== 'string' || title.trim() === '' || description.trim() === '') {
      return NextResponse.json({ error: "Job title and description are required and must be non-empty strings." }, { status: 400 });
    }
    const prompt = `Generate a professional Upwork/Fiverr proposal for a job titled "${title}" with description: "${description}". Highlight skills in AI, web development, and digital marketing. Include a call-to-action with a Calendly link. Keep it concise.`;
    const fakeGeminiReply = `
Dear [Client Name],
I’m Jose, a full-stack developer with expertise in AI, web development, and digital marketing. For your "${title}" project, I’ll deliver a high-quality solution by leveraging my skills to achieve your desired outcome. My past work, including the Planet Beauty chatbot and Google Ads optimizers, demonstrates my ability to deliver impactful results.
I'm confident I can help you succeed. Let’s discuss your project further: [Your Calendly Link]
Best regards,
Jose
    `.trim();
    if (prisma) {
      await prisma.proposal.create({
        data: { title, description, proposal: fakeGeminiReply },
      });
    }
    return NextResponse.json({ proposal: fakeGeminiReply });
  } catch (error) {
    console.error("Error in proposal route:", error);
    return NextResponse.json({ error: "Failed to generate proposal: " + error.message }, { status: 500 });
  }
}
