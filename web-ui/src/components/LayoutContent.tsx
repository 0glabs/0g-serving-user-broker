"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface LayoutContentProps {
  children: React.ReactNode;
}

export const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className={`min-h-screen bg-gray-50 ${isHomePage ? "pt-20" : "pl-52 pt-20"}`}>
      {isHomePage ? null : <Sidebar />}
      <main className="p-4">
        {isHomePage ? (
          <div className="container mx-auto px-4 py-8">{children}</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
