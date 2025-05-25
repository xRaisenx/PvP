// app/layout.js
import './globals.css';
import Navbar from '@/components/Navbar'; // Assuming components/Navbar.js will be created

export const metadata = {
  title: "Jose's AI-Powered Portfolio",
  description: 'Personal portfolio with AI-driven tools, Next.js 15, and App Router',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-800 antialiased"> {/* Added text-gray-800 and antialiased */}
        <Navbar />
        <main className="min-h-screen"> {/* Ensure main content can fill screen */}
          {children}
        </main>
        <footer className="bg-blue-600 text-white text-center p-6"> {/* Increased padding */}
          <p>Developed with ❤️ by Jose</p>
        </footer>
      </body>
    </html>
  );
}
