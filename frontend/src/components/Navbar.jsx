import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full bg-[#1e3c72] text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">Sign Recognition Dashboard</h1>
      <div className="flex gap-4">
        <a href="/" className="hover:text-gray-300">Dashboard</a>
        <a href="/app" className="hover:text-gray-300">App</a>
      </div>
    </nav>
  );
};

export default Navbar;
