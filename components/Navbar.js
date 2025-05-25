// components/Navbar.js
export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 sticky top-0 z-50 shadow-md"> {/* Added sticky, z-index, shadow */}
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jose's Portfolio</h1>
        <div className="space-x-4">
          <a href="#home" className="hover:underline px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">Home</a>
          <a href="#code-library" className="hover:underline px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">Code Library</a>
          <a href="#tools" className="hover:underline px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">Tools</a>
          <a href="#contact" className="hover:underline px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">Contact</a>
        </div>
      </div>
    </nav>
  );
}
