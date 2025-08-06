"use client";

import React from "react";

interface MainContentLoaderProps {
  pageType?: 'home' | 'inference' | 'chat' | 'ledger' | 'fine-tuning';
  message?: string;
}

const getSkeletonForPage = (pageType: string) => {
  switch (pageType) {
    case 'home':
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-20 bg-gray-200 rounded-lg mb-8"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'inference':
      return (
        <div className="w-full">
          <div className="mb-3">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-300 p-5">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-4">
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'chat':
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className="animate-pulse">
                    <div className={`max-w-md p-4 rounded-lg ${i % 2 === 0 ? 'bg-blue-100' : 'bg-white'}`}>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'ledger':
      return (
        <div className="w-full">
          <div className="mb-3">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="bg-white rounded-t-xl border border-gray-200">
            <div className="flex border-b border-gray-200">
              <div className="px-6 py-4 bg-blue-50 flex-1">
                <div className="animate-pulse h-5 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="px-6 py-4 flex-1">
                <div className="animate-pulse h-5 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'fine-tuning':
      return (
        <div className="w-full">
          <div className="mb-3">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-6"></div>
              <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 mt-0.5"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-40 mt-3"></div>
                  </div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0 mt-0.5"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
  }
};

export const MainContentLoader: React.FC<MainContentLoaderProps> = ({ 
  pageType = 'default',
  message 
}) => {
  return (
    <div className="w-full min-h-[500px] relative">
      {/* Loading overlay with skeleton */}
      <div className="w-full h-full">
        {message && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}
        {getSkeletonForPage(pageType)}
      </div>
      
      {/* Subtle loading indicator overlay */}
      <div className="absolute top-0 left-0 right-0 h-1">
        <div className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse"></div>
      </div>
    </div>
  );
};

export default MainContentLoader;