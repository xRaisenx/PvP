// app/api/clients/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' }});
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, projects } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    // Basic email validation regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    const client = await prisma.client.create({
      data: { name, email, projects: projects || "" },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
         return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create client: " + error.message }, { status: 500 });
  }
}
