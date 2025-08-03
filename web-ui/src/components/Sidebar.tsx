"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    {
      href: "/inference",
      label: "Inference",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.9L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      href: "/fine-tuning",
      label: "Fine-tuning",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      href: "/ledger",
      label: "Account",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/ledger") {
      return pathname === "/ledger" || pathname.startsWith("/ledger");
    }
    return pathname === href;
  };

  return (
    <div className="w-52 bg-white shadow-lg border-r border-gray-200 min-h-screen fixed top-0 left-0 z-10">
      <div className="px-3 pt-24 pb-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className={`${
                  isActive(item.href) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};
