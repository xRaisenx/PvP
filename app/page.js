// app/page.js
'use client';

import { useState, useEffect } from 'react';
import CodeSnippet from './../components/CodeSnippet';
import ToolCard from './../components/ToolCard';
import Chatbot from './../components/Chatbot';
import { jsPDF } from 'jspdf';

// Helper function for client-side CSV generation
function exportToCsvClientSide(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("No data to export.");
    return;
  }
  const replacer = (key, value) => value === null ? '' : value;
  const header = Object.keys(rows[0]);
  let csv = rows.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  csv.unshift(header.join(','));
  csv = csv.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    alert("CSV export not fully supported in this browser.");
  }
}

export default function Home() {
  const [snippets, setSnippets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [proposal, setProposal] = useState('');

  useEffect(() => {
    async function loadSnippets() {
      try {
        const res = await fetch('/api/snippets');
        if (!res.ok) throw new Error(`Failed to fetch snippets: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setSnippets(data);
      } catch (error) {
        console.error("Error loading snippets:", error);
        // Optionally set error state for UI
      }
    }
    loadSnippets();
  }, []);

  const generateProposal = async () => {
    try {
      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle, description: jobDescription }),
      });
      if (!res.ok) throw new Error(`Failed to generate proposal: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setProposal(data.proposal);
    } catch (error) {
      console.error("Error generating proposal:", error);
      setProposal("Failed to generate proposal. Please check console for details.");
    }
  };

  const downloadProposal = () => {
    if (!proposal || proposal.startsWith("Failed")) {
      alert("No valid proposal to download.");
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text(proposal, 10, 10, { maxWidth: 190 }); // Ensure text wrapping
      doc.save('proposal.pdf');
    } catch (error) {
      console.error("Error generating PDF proposal:", error);
      alert("Failed to generate PDF for proposal.");
    }
  };

  const handleExportSnippetsToCsv = () => {
    exportToCsvClientSide('code_snippets.csv', filteredSnippets); // Export filtered snippets
  };

  const filteredSnippets = snippets.filter(snippet =>
    (snippet.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (snippet.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (snippet.language?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const tools = [
    { id: 'ads-optimizer', name: 'Google Ads Optimizer', description: 'Analyze and optimize Google Ads campaigns.' },
    { id: 'code-generator', name: 'Code Generator', description: 'Generate code snippets with AI.' },
    { id: 'code-debugger', name: 'Code Debugger', description: 'Debug code with AI-driven fixes.' },
    { id: 'project-manager', name: 'Project Manager', description: 'Track tasks with AI suggestions (Kanban UI to be built).' },
    { id: 'csv-maker', name: 'CSV Maker', description: 'Create custom CSV files (e.g., for snippets).' },
    { id: 'pdf-reporting', name: 'PDF Reporting', description: 'Generate PDF reports (e.g., for proposals).' },
    { id: 'seo-audit', name: 'SEO Auditing', description: 'Analyze websites for SEO (UI/logic to be built).' },
    { id: 'email-responder', name: 'Email Responder', description: 'Automate email responses (Mailchimp to be integrated).' },
    { id: 'gig-generator', name: 'Fiverr Gig Generator', description: 'Create Fiverr gig descriptions.' },
    { id: 'todo-list', name: 'To-Do List', description: 'Manage daily tasks.' },
    { id: 'calendar-scheduler', name: 'Calendar Scheduler', description: 'Schedule tasks with Google Calendar (OAuth to be fully implemented).' },
    { id: 'client-manager', name: 'Client Manager', description: 'Track client details.' },
    { id: 'analytics-dashboard', name: 'Analytics Dashboard', description: 'Visualize tool usage (displays sample data).' },
    // Note: The Python Calculator tool is added dynamically by the chatbot if generated.
  ];

  return (
    <main>
      {/* Homepage Section */}
      <section id="home" className="py-16 bg-white">
        <div className="container mx-auto text-center px-4">
          <img src="https://via.placeholder.com/150" alt="Jose's Headshot" className="rounded-full mx-auto mb-4 w-36 h-36 object-cover" />
          <h2 className="text-4xl font-bold mb-4">Hi, I'm Jose</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Full-stack developer and AI expert specializing in ecommerce, digital marketing, and automation. Built chatbots
            for Planet Beauty, Google Ads optimizers, and Freelance Opportunity Finder.
          </p>
          <a
            href="https://calendly.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold transition-colors"
          >
            Book a Consultation
          </a>
          <div className="mt-12 max-w-md mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Quick Proposal Generator</h3>
            <input
              type="text"
              placeholder="Job Title (e.g., 'Develop AI Chatbot')"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <textarea
              placeholder="Job Description (Paste here)"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md h-36 focus:ring-blue-500 focus:border-blue-500"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <button
              onClick={generateProposal}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 text-lg font-semibold transition-colors"
            >
              Generate Proposal
            </button>
            {proposal && (
              <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50 text-left">
                <h4 className="font-semibold text-md mb-2">Generated Proposal:</h4>
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-700">{proposal}</pre>
                <div className="mt-4 flex gap-2">
                    <button
                    onClick={() => navigator.clipboard.writeText(proposal)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                    Copy Proposal
                    </button>
                    <button
                    onClick={downloadProposal}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 text-sm"
                    >
                    Download PDF
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Code Library Section */}
      <section id="code-library" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Code Snippets Library</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-3">
            <input
              type="text"
              placeholder="Search snippets by title, description, or language..."
              className="w-full max-w-lg p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleExportSnippetsToCsv}
              className="bg-teal-500 text-white px-5 py-3 rounded-md hover:bg-teal-600 font-semibold transition-colors w-full sm:w-auto"
            >
              Export Filtered to CSV
            </button>
          </div>
          {filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <CodeSnippet key={snippet.id} {...snippet} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No snippets found matching your search criteria.</p>
          )}
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">My AI-Powered Tools</h2>
          {tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>
          ) : (
             <p className="text-center text-gray-600">Tools section is currently empty.</p>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
          <form action="https://formspree.io/f/your-form-id" method="POST" className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="mb-5">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 text-left">Your Name</label>
                <input type="text" name="name" id="name" placeholder="John Doe" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="mb-5">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 text-left">Your Email</label>
                <input type="email" name="email" id="email" placeholder="you@example.com" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="mb-5">
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 text-left">Your Message</label>
                <textarea name="message" id="message" placeholder="How can I help you today?" rows="4" className="w-full p-3 border border-gray-300 rounded-md h-36 focus:ring-blue-500 focus:border-blue-500" required></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-lg font-semibold transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </section>

      <Chatbot />
    </main>
  );
}
