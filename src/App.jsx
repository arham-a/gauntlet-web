import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./assets/components/Sidebar";
import Navbar from "./assets/components/Navbar";
import Competition from "./pages/Competition";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import CompetitonPage from "./pages/CompetitonPage";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import AddComp from "./pages/AddComp";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import { UserProvider } from "./context/UserContext";
import { GlobalStatsProvider } from "./context/GlobalStatsContext";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen((v) => !v);

  // Auth screens stand alone, without the app chrome around them.
  const bareRoutes = ["/login", "/signup"];
  const isBare = bareRoutes.includes(location.pathname);

  return (
    <UserProvider>
      <GlobalStatsProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--rule)",
              borderRadius: "4px",
            },
          }}
        />
        <div className="flex h-screen overflow-hidden bg-paper">
          {!isBare && <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />}

          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {!isBare && <Navbar toggleSidebar={toggleSidebar} />}

            <main className="flex-1 overflow-y-auto scrollbar-thin">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/competitions" element={<Competition />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/competition-page/:id" element={<CompetitonPage />} />
                <Route path="/add-comp" element={<AddComp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </GlobalStatsProvider>
    </UserProvider>
  );
};

export default App;
