// app/api/python-calculator/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { num1, op, num2 } = await req.json();
    // Basic validation
    if (typeof num1 !== 'number' || typeof num2 !== 'number' || !['+', '-', '*', '/'].includes(op)) {
        return NextResponse.json({ error: 'Invalid input. Ensure num1, num2 are numbers and op is +, -, *, /.' }, { status: 400 });
    }

    let result;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*') result = num1 * num2;
    else if (op === '/') {
        if (num2 === 0) return NextResponse.json({ error: 'Error: Division by zero' }, { status: 400 });
        result = num1 / num2;
    }
    else return NextResponse.json({ error: 'Invalid operator' }, { status: 400 }); // Should be caught by validation above
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in python-calculator API:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
