// components/CodeSnippet.js
import { useEffect } from 'react';
import Prism from 'prismjs';
// Using prism-tomorrow theme as established in previous successful step
import 'prismjs/themes/prism-tomorrow.css'; 

export default function CodeSnippet({ title, description, code, language }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Prism) {
      setTimeout(() => Prism.highlightAll(), 0);
    }
  }, [code, language]);

  return (
    <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-lg flex flex-col justify-between h-full"> {/* Added h-full for consistent height in grid */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 min-h-[40px]">{description}</p> {/* min-h for description consistency */}
        <pre className={`language-${language || 'javascript'} bg-gray-800 p-4 rounded-md text-sm overflow-auto !text-white max-h-60`}> {/* Added max-h-60 */}
          <code className={`language-${language || 'javascript'}`}>
            {code || "// No code available"}
          </code>
        </pre>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(code || '')}
        disabled={!code}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-4 text-sm font-medium transition-colors self-start disabled:opacity-50"
      >
        Copy Code
      </button>
    </div>
  );
}
