// app/api/ads-optimizer/route.js
import prisma from 'lib/prisma';
import { NextResponse } from 'next/server';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

export async function POST(req) {
  try {
    const { campaignData } = await req.json();
    if (!campaignData) {
      return NextResponse.json({ error: "Campaign data is required." }, { status: 400 });
    }
    const prompt = `Analyze Google Ads campaign data: ${JSON.stringify(campaignData)}. Provide keyword and bid suggestions. Format as JSON array of objects: [{"keyword": "...", "action": "...", "detail": "..."}].`;
    const fakeGeminiReply = {
      suggestions: [
        { keyword: 'ecommerce solution', action: 'Increase bid', detail: 'by 10%' },
        { keyword: 'AI chatbot development', action: 'Add keyword', detail: 'Match type: Broad' },
        { keyword: 'Next.js development', action: 'Monitor', detail: 'High CPC, observe performance' },
      ],
      summary: 'Campaign analysis complete. Focus on high-intent keywords and monitor high CPC terms.',
    };
    if (prisma) {
      await prisma.report.create({
        data: { type: 'ads-optimizer', content: JSON.stringify(fakeGeminiReply) },
      });
    }
    const csvPath = `/tmp/ads-report-${Date.now()}.csv`; // Write to /tmp for serverless environments
    if (!fakeGeminiReply.suggestions || !Array.isArray(fakeGeminiReply.suggestions) || fakeGeminiReply.suggestions.length === 0) {
        return NextResponse.json({ suggestions: fakeGeminiReply, csvPath: null, message: "Analysis complete, but no specific suggestions to export." });
    }
    const csvWriterInstance = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'keyword', title: 'Keyword' }, { id: 'action', title: 'Action' }, { id: 'detail', title: 'Detail' },
      ],
    });
    await csvWriterInstance.writeRecords(fakeGeminiReply.suggestions);
    // Returning the path like this means the client needs a way to access this server-generated file.
    // This is simplified; a real app might stream the file or return a signed URL.
    return NextResponse.json({ suggestions: fakeGeminiReply, csvPath: csvPath });
  } catch (error) {
    console.error('Error in ads-optimizer route:', error);
    return NextResponse.json({ error: `Failed to process request: ${error.message}` }, { status: 500 });
  }
}
