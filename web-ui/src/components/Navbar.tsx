"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
      <div className="px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo - always show */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              0G
            </div>
            <span className="text-xl font-bold text-gray-800">Compute Network</span>
          </Link>

          {/* RainbowKit Connect Button */}
          <div className="flex items-center">
            <ConnectButton 
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
