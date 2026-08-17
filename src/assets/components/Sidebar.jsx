import {
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  TrophyIcon,
  UserIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../lib/useTheme";
import { Button } from "./ui";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isSignedIn, userInfo, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, cycle } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toggleSidebar();
  };

  const menuItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/explore", label: "Explore", icon: MagnifyingGlassIcon },
    { path: "/competitions", label: "My competitions", icon: TrophyIcon },
    { path: "/profile", label: "Profile", icon: UserIcon },
  ];

  const ThemeIcon = mode === "light" ? SunIcon : mode === "dark" ? MoonIcon : ComputerDesktopIcon;
  const themeLabel = mode === "light" ? "Light" : mode === "dark" ? "Dark" : "System";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-ink/40 z-40 md:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-surface border-r border-rule transform z-50
                   transition-transform duration-200 ease-out
                   ${isOpen ? "translate-x-0" : "-translate-x-full"}
                   md:translate-x-0 md:static md:w-60 h-screen flex-shrink-0 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-rule">
          <Link to="/" className="font-semibold tracking-tight text-ink" onClick={toggleSidebar}>
            Gauntlet
          </Link>
          <button
            className="md:hidden p-1 text-muted hover:text-ink"
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-0.5">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={toggleSidebar}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-surface-alt text-ink font-medium"
                    : "text-muted hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3">
          <Button className="w-full" onClick={() => { navigate("/add-comp"); toggleSidebar(); }}>
            Host a competition
          </Button>
        </div>

        <div className="mt-auto border-t border-rule p-3">
          <button
            onClick={cycle}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm text-sm text-muted hover:text-ink hover:bg-surface-alt transition-colors"
            aria-label={`Theme: ${themeLabel}. Change theme`}
          >
            <ThemeIcon className="w-[18px] h-[18px]" />
            <span>Theme</span>
            <span className="label ml-auto">{themeLabel}</span>
          </button>

          {isSignedIn && userInfo ? (
            <div className="mt-2 pt-3 border-t border-rule">
              <div className="px-2.5 mb-2 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{userInfo.username}</p>
                <p className="text-xs text-muted truncate">{userInfo.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm text-sm text-muted hover:text-brand hover:bg-surface-alt transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-[18px] h-[18px]" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="mt-2 pt-3 border-t border-rule flex flex-col gap-2">
              <Button variant="ghost" onClick={() => { navigate("/login"); toggleSidebar(); }}>
                Sign in
              </Button>
              <p className="text-xs text-muted text-center">
                New here?{" "}
                <Link to="/signup" className="text-brand hover:underline" onClick={toggleSidebar}>
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
