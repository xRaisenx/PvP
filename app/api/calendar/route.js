// app/api/calendar/route.js
import prisma from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { title, start, end } = await req.json();
    if (!title || !start || !end) {
      return NextResponse.json({ error: "Title, start date, and end date are required." }, { status: 400 });
    }
    if (isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
      return NextResponse.json({ error: "Invalid date format for start or end date." }, { status: 400 });
    }
    // Placeholder for Google Calendar API integration (OAuth 2.0 flow needed for production)
    const fakeEvent = { 
      summary: title, 
      start: { dateTime: new Date(start).toISOString() }, 
      end: { dateTime: new Date(end).toISOString() }, 
      id: `fakeevent-${Date.now()}`,
    };
    if (prisma) {
      await prisma.event.create({
        data: { title, start: new Date(start), end: new Date(end) },
      });
    }
    return NextResponse.json({ event: fakeEvent });
  } catch (error) {
    console.error('Error in calendar route:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Failed to process calendar request.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
