import React from "react";
import { Link } from "react-router-dom";
import { EnvelopeIcon, HeartIcon } from "@heroicons/react/24/solid";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-red-900/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
              Gauntlet
            </h2>
            <p className="text-gray-400 max-w-md mb-4">
              Host a competition or run someone else's. Set the challenge, judge the
              submissions, crown a winner.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <EnvelopeIcon className="h-5 w-5 text-red-400" />
              <a href="mailto:support@gauntlet.dev" className="hover:text-red-400 transition-colors">
                support@gauntlet.dev
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-400 hover:text-red-400 transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/competitions" className="text-gray-400 hover:text-red-400 transition-colors">
                  My Competitions
                </Link>
              </li>
              <li>
                <Link to="/add-comp" className="text-gray-400 hover:text-red-400 transition-colors">
                  Create Competition
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-red-400 transition-colors">
                  Profile Settings
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">
              © {currentYear} Gauntlet. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center mt-4 md:mt-0">
              Made with <HeartIcon className="h-4 w-4 text-red-500 mx-1" /> for competitors worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
