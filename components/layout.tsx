'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">SM Activity 관리 시스템</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => router.push('/sm-activities')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/sm-activities'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                SM Activity
              </button>
              <button
                onClick={() => router.push('/inquiries')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/inquiries'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                현업문의
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} SM Activity 관리 시스템
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 