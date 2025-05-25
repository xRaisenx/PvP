// app/api/chat/route.js
import prisma from '@/lib/prisma';
import { commitToGitHub, revertCommit, fetchFileContent } from '@/lib/github';
import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';

async function callGeminiApi(prompt) {
  console.log(`Simulating Gemini API call for prompt: "${prompt.substring(0, 100)}..."`);
  if (prompt.includes("Plan how to add tool python calculator")) {
    return { 
      text: JSON.stringify({
        plan: '1. Create snippet for Python calculator. 2. Create API route for calculator logic. 3. Update app/page.js to include the new tool. 4. Commit all changes.',
        filesToModify: ['app/page.js', 'app/api/python-calculator/route.js', 'prisma/schema.prisma'],
        codeChanges: [
          {
            filePath: 'app/page.js', type: 'modification', description: 'Add Python Calculator tool to the tools array in UI.',
            newContentSnippet: `{ id: 'python-calculator', name: 'Python Calculator', description: 'Run a simple calculator in Python.' },` 
          },
          {
            filePath: 'app/api/python-calculator/route.js', type: 'creation', description: 'Create API route for Python calculator backend logic.',
            newContentSnippet: `
import { NextResponse } from 'next/server';
export async function POST(req) {
  try {
    const { num1, op, num2 } = await req.json();
    let result;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*') result = num1 * num2;
    else if (op === '/') result = num2 !== 0 ? num1 / num2 : 'Error: Division by zero';
    else return NextResponse.json({ error: 'Invalid operator' }, { status: 400 });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in python-calculator API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`.trim()
          }
        ],
        validationSteps: ['Check UI for new tool card', 'Verify snippet in database', 'Test /api/python-calculator endpoint with sample data']
      })
    };
  } else if (prompt.startsWith('Plan how to')) {
    const toolName = prompt.split(' ')[3] || 'new'; // Basic extraction
    return {
      text: JSON.stringify({
        plan: "Dynamic feature generation: 1. Create new API route. 2. Update frontend to include the tool. 3. Commit changes.",
        filesToModify: ['app/page.js', `app/api/${toolName.toLowerCase()}-tool/route.js` ],
        codeChanges: [
          {
            filePath: 'app/page.js', type: 'modification', description: 'Add new tool to tools array.',
            newContentSnippet: `{ id: '${toolName.toLowerCase()}-tool', name: '${toolName} Tool', description: 'AI-generated tool.' },`
          },
          {
            filePath: `app/api/${toolName.toLowerCase()}-tool/route.js`, type: 'creation', description: 'Create new API route for the tool.',
            newContentSnippet: `
import { NextResponse } from 'next/server';
export async function POST(req) {
  return NextResponse.json({ message: '${toolName} tool endpoint ready' });
}`.trim()
          }
        ],
        validationSteps: ['Verify UI for new tool', 'Test new API endpoint']
      })
    };
  }
  return { text: `Simulated Gemini response to: ${prompt.substring(0, 150)}...` };
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).replace(/[<>{}]/g, '');
}

async function getAiAssistance(prompt) {
  const cleanedPrompt = sanitizeInput(prompt);
  const geminiResponse = await callGeminiApi(cleanedPrompt);
  return geminiResponse.text;
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    const cleanedMessage = sanitizeInput(message);

    if (!cleanedMessage || cleanedMessage.length === 0 || cleanedMessage.length > 2000) {
      return NextResponse.json({ reply: 'Invalid input: Message is empty or too long.' }, { status: 400 });
    }

    const commandMatch = cleanedMessage.match(/^(add|update|remove|generate)\s+(\S+)(?:\s+(.*))?$/i);

    if (commandMatch) {
      const action = commandMatch[1].toLowerCase();
      const entity = sanitizeInput(commandMatch[2].toLowerCase());
      const content = sanitizeInput(commandMatch[3] || "");

      if (!entity) return NextResponse.json({ reply: 'Invalid command: Entity is missing.' }, { status: 400 });
      
      const planPrompt = `Plan how to ${action} ${entity} with details: ${content}. Provide JSON: {plan: string, filesToModify: string[], codeChanges: [{filePath: string, type: 'creation'|'modification', description: string, newContentSnippet: string}], validationSteps: string[]}.`;
      const aiPlanResponseText = await getAiAssistance(planPrompt);
      let planDetails;
      try {
        planDetails = JSON.parse(aiPlanResponseText);
      } catch (e) {
        console.error("AI planning response was not valid JSON:", aiPlanResponseText, e);
        return NextResponse.json({ reply: 'AI planning failed. Details: ' + aiPlanResponseText }, { status: 500 });
      }

      if (action === 'add' && entity === 'snippet') {
        const parts = content.split('|');
        if (parts.length < 4) return NextResponse.json({ reply: 'Invalid snippet format. Use Title|Description|Code|Language' }, { status: 400 });
        const [title, description, code, language] = parts.map(sanitizeInput);
        await prisma.snippet.create({ data: { title, description, code, language } });
        const pageContent = await fetchFileContent('app/page.js') || ''; 
        await commitToGitHub(`Add snippet: ${title}`, 'app/page.js', pageContent, Date.now());
        return NextResponse.json({ reply: `Snippet '${title}' added and committed.` });
      } else if ((action === 'add' || action === 'generate') && entity === 'tool') {
        if (!planDetails.filesToModify || !planDetails.codeChanges) return NextResponse.json({ reply: 'AI plan incomplete.' }, { status: 500 });
        for (const change of planDetails.codeChanges) {
          let currentContent = "";
          if (change.type === 'modification') {
            currentContent = (await fetchFileContent(change.filePath));
            if (currentContent === null) return NextResponse.json({ reply: `Failed to fetch ${change.filePath}` }, { status: 500 });
            if (change.filePath === 'app/page.js' && currentContent.includes('const tools = [')) {
               if (!currentContent.includes(change.newContentSnippet)) { // Avoid duplicates
                 currentContent = currentContent.replace('const tools = [', `const tools = [\n    ${change.newContentSnippet}`);
               }
            } else { currentContent += "\n" + change.newContentSnippet; }
          } else if (change.type === 'creation') { currentContent = change.newContentSnippet; }
          const commitRes = await commitToGitHub(`${action} tool: ${content} - ${change.filePath}`, change.filePath, currentContent, Date.now());
          if (!commitRes.success) return NextResponse.json({ reply: `Commit failed for ${change.filePath}: ${commitRes.error}` }, { status: 500 });
        }
        if (content.includes('python calculator') && planDetails.codeChanges.some(c => c.filePath.includes('python-calculator'))) {
           const calculatorCode = `def calculator(): print("Simple Calc")`; // Simplified for brevity
           await prisma.snippet.create({ data: { title: 'Python Calculator', description: 'Simple calculator tool', code: calculatorCode, language: 'python' }});
        }
        return NextResponse.json({ reply: `Tool '${content}' (${action}ed). Plan: ${planDetails.plan}` });
      } else if (action === 'update' && entity === 'bio') {
        let currentPage = await fetchFileContent('app/page.js');
        if (currentPage === null) return NextResponse.json({ reply: 'Failed to fetch page content.' }, { status: 500 });
        const bioRegex = /(<p className="text-lg mb-6">)([^<]*)(<\/p>)/;
        if (!bioRegex.test(currentPage)) return NextResponse.json({ reply: 'Bio section not found.' }, { status: 400 });
        const updatedPage = currentPage.replace(bioRegex, `$1${sanitizeInput(content)}$3`);
        await commitToGitHub(`Update portfolio bio`, 'app/page.js', updatedPage, Date.now());
        return NextResponse.json({ reply: 'Bio updated.' });
      } else if (action === 'update' && entity === 'ads-optimizer') {
        const adsOptimizerPath = 'app/api/ads-optimizer/route.js';
        let currentAdsOptimizer = await fetchFileContent(adsOptimizerPath);
        if (currentAdsOptimizer === null) return NextResponse.json({ reply: `Failed to fetch ${adsOptimizerPath}` }, { status: 500 });
        const updatedAdsOptimizer = `// Feature update: ${sanitizeInput(content)}\n${currentAdsOptimizer}`;
        await commitToGitHub(`Update Ads Optimizer: ${sanitizeInput(content)}`, adsOptimizerPath, updatedAdsOptimizer, Date.now());
        return NextResponse.json({ reply: 'Ads optimizer updated.' });
      } else if (action === 'remove' && entity === 'tool') {
        let currentPage = await fetchFileContent('app/page.js');
        if (currentPage === null) return NextResponse.json({ reply: 'Failed to fetch page content.' }, { status: 500 });
        const toolNameForRegex = sanitizeInput(content).replace(/[.*+?^${}()|[\]\]/g, '\\$&');
        const toolRegex = new RegExp(`\{\s*id:\s*['"][^'"]+['"],\s*name:\s*['"]${toolNameForRegex}['"],\s*description:\s*['"][^'"]*['"]\s*\},?\s*\n?`, 'g');
        if (!toolRegex.test(currentPage)) return NextResponse.json({ reply: `Tool '${content}' not found.` }, { status: 400 });
        const updatedPage = currentPage.replace(toolRegex, '');
        await commitToGitHub(`Remove tool: ${content}`, 'app/page.js', updatedPage, Date.now());
        return NextResponse.json({ reply: `Tool '${content}' removed.` });
      } else {
        return NextResponse.json({ reply: `Command '${action} ${entity}' received. AI Plan: ${JSON.stringify(planDetails)}` });
      }
    } else if (cleanedMessage.toLowerCase().startsWith('revert ')) {
      const commitSha = sanitizeInput(cleanedMessage.split(' ')[1]);
      if (!commitSha || commitSha.length < 7) return NextResponse.json({ reply: 'Invalid commit SHA.' }, { status: 400 });
      const revertResult = await revertCommit(commitSha);
      if (revertResult.success) return NextResponse.json({ reply: 'Revert action completed.' });
      return NextResponse.json({ reply: `Revert failed: ${revertResult.error}` }, { status: 500 });
    }

    const aiReply = await getAiAssistance(`User query: ${cleanedMessage}`);
    if (prisma) await prisma.chatHistory.create({ data: { userMessage: cleanedMessage, aiReply: aiReply }});
    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Critical Error in chat POST route:", error);
    return NextResponse.json({ reply: "Error: " + (error.message || "Unexpected server error.") }, { status: 500 });
  }
}
