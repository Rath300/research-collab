"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  FiHome, 
  FiFolder, 
  FiUsers, 
  FiCalendar, 
  FiMessageSquare, 
  FiFileText, 
  FiSettings, 
  FiLogOut, 
  FiMenu,
  FiX
} from "react-icons/fi";

export default function SideMenu() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const supabase = createClientComponentClient();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Projects", href: "/projects", icon: FiFolder },
    { name: "Collaborators", href: "/collaborators", icon: FiUsers },
    { name: "Calendar", href: "/calendar", icon: FiCalendar },
    { name: "Messages", href: "/messages", icon: FiMessageSquare },
    { name: "Publications", href: "/publications", icon: FiFileText },
    { name: "Settings", href: "/settings", icon: FiSettings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-researchbee-medium-gray text-white"
        >
          {isMobileOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileMenu}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full bg-researchbee-dark-gray z-40 transition-all duration-300 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:block 
          ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-researchbee-medium-gray">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-researchbee-yellow rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">RB</span>
              </div>
              {!isCollapsed && (
                <h1 className="ml-3 text-xl font-bold text-white">Research-Bee</h1>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-researchbee-yellow md:block hidden"
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-researchbee-yellow text-black"
                            : "text-white hover:bg-researchbee-medium-gray"
                        }
                        ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "" : "text-researchbee-light-gray"}`} />
                      {!isCollapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-researchbee-medium-gray">
            <button
              onClick={handleSignOut}
              className={`flex items-center text-researchbee-light-gray hover:text-white
                ${isCollapsed ? "justify-center" : ""}`}
            >
              <FiLogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Sign out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 