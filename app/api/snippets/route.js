// app/api/snippets/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const snippets = await prisma.snippet.findMany({ orderBy: { createdAt: 'desc' }});
    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json({ error: "Failed to fetch snippets: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, description, code, language } = await req.json();
    if (!title || !description || !code || !language || [title,description,code,language].some(s => typeof s !== 'string' || s.trim() === '')) {
      return NextResponse.json({ error: "Title, description, code, and language are required and must be non-empty strings." }, { status: 400 });
    }
    const snippet = await prisma.snippet.create({
      data: { title, description, code, language },
    });
    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json({ error: "Failed to create snippet: " + error.message }, { status: 500 });
  }
}
