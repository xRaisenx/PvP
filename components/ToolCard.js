// components/ToolCard.js
'use client';

import { useRouter } from 'next/navigation';

export default function ToolCard({ id, name, description }) {
  const router = useRouter();

  const openTool = () => {
    if (id === 'analytics-dashboard') {
      router.push('/tools/analytics-dashboard'); // Assuming a page route will be created
    } else if (id === 'python-calculator') {
      alert(`Opening Python Calculator... (Modal or specific UI needed)`);
    } else {
      alert(`Opening ${name} (${id})... (Modal or dedicated page needed)`);
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col justify-between h-full"> {/* Added h-full */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4 min-h-[60px]">{description}</p> {/* Increased min-h for description */}
      </div>
      <button
        onClick={openTool}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors self-start"
      >
        Try Now
      </button>
    </div>
  );
}
