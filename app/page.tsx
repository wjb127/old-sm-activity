'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout';

export default function Home() {
  const router = useRouter();

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">SM Activity 관리 시스템</h1>
          <p className="text-xl text-gray-600">
            SM Activity 및 현업문의를 효율적으로 관리하는 시스템입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">SM Activity</h2>
            <p className="text-gray-600 mb-6">
              대시보드/PLAN 작업 활동을 등록하고 관리합니다.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push('/sm-activities')}
            >
              SM Activity 관리
            </Button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">현업문의</h2>
            <p className="text-gray-600 mb-6">
              현업 부서의 문의사항을 등록하고 관리합니다.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push('/inquiries')}
            >
              현업문의 관리
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
