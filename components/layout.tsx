'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  smActivitiesContent?: React.ReactNode;
  inquiriesContent?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  smActivitiesContent,
  inquiriesContent
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname === '/inquiries' ? 'inquiries' : 'sm-activities';

  // 탭 기능이 필요한 경우에만 탭을 표시
  const showTabs = smActivitiesContent && inquiriesContent;

  const handleTabChange = (value: string) => {
    if (value === 'inquiries') {
      router.push('/inquiries');
    } else {
      router.push('/sm-activities');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">SM Activity 관리 시스템</h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showTabs ? (
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="sm-activities">SM Activity</TabsTrigger>
                <TabsTrigger value="inquiries">현업문의</TabsTrigger>
              </TabsList>
              <TabsContent value="sm-activities" className="mt-0">
                {smActivitiesContent}
              </TabsContent>
              <TabsContent value="inquiries" className="mt-0">
                {inquiriesContent}
              </TabsContent>
            </Tabs>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout; 