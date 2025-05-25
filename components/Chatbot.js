// components/Chatbot.js
'use client';

import { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'You', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput(''); 

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }), // Send only the text
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ reply: "Server returned an error."}));
        setMessages(prevMessages => [...prevMessages, { sender: 'AI', text: `Error: ${errorData.reply || res.statusText}` }]);
        return;
      }
      const data = await res.json();
      setMessages(prevMessages => [...prevMessages, { sender: 'AI', text: data.reply }]);
    } catch (error) {
      setMessages(prevMessages => [...prevMessages, { sender: 'AI', text: "Failed to connect to the chatbot. Please check your connection." }]);
      console.error("Chatbot send message error:", error);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant" // Added title attribute
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg z-50 flex items-center justify-center" // Enhanced styling
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12s4.477-10 10-10 10 4.477 10 10z" />
          </svg>
          <span className="ml-2 sm:inline hidden">AI Assistant</span> {/* Hide text on very small screens */}
        </button>
      )}
      <div className={`fixed bottom-4 right-4 w-full max-w-md sm:max-w-lg bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}> {/* Improved open/close animation */}
        <div className="p-3 bg-blue-600 text-white flex justify-between items-center rounded-t-lg cursor-pointer" onClick={() => setIsOpen(!isOpen)}> {/* Click header to toggle */}
          <span className="font-semibold">AI Assistant</span>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false);}} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button> {/* Stop propagation */}
        </div>
        <div className="p-4 h-80 overflow-y-auto bg-gray-50 flex-grow space-y-3"> {/* Added space-y */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'AI' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
                <b className="block text-xs mb-0.5 opacity-70">{msg.sender}</b> {msg.text}
                </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex items-center gap-2"> {/* Flex for input and button */}
            <input
              type="text"
              placeholder="Ask me anything..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 flex-grow"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} // Send on Enter, allow Shift+Enter for newline
            />
            <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
