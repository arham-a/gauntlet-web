import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="bg-dark text-white p-4 flex justify-between items-center md:hidden">
      <h1 className="text-lg font-bold">Gauntlet</h1>
      <Bars3Icon className="w-6 h-6 cursor-pointer" onClick={toggleSidebar} />
    </nav>
  );
};

export default Navbar;
