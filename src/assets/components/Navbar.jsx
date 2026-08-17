import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => (
  <header className="md:hidden flex items-center justify-between h-14 px-4 bg-surface border-b border-rule">
    <Link to="/" className="font-semibold tracking-tight text-ink">
      Gauntlet
    </Link>
    <button onClick={toggleSidebar} className="p-1 text-muted hover:text-ink" aria-label="Open menu">
      <Bars3Icon className="w-6 h-6" />
    </button>
  </header>
);

export default Navbar;
