// app/api/tasks/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' }});
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, priority, dueDate } = await req.json();
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: "Title is required and must be a non-empty string." }, { status: 400 });
    }
    if (dueDate && isNaN(new Date(dueDate).getTime())) { // Check if dueDate is provided and valid
        return NextResponse.json({ error: "Invalid due date format." }, { status: 400 });
    }
    const task = await prisma.task.create({
      data: { 
        title, 
        priority: priority || "Normal", 
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default due date: 1 week
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task: " + error.message }, { status: 500 });
  }
}
