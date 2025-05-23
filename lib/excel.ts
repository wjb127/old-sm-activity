import * as XLSX from 'xlsx';
import { SMActivity, BusinessInquiry } from '@/types/database';

interface SMActivityRow {
  document_type?: string;
  category?: string;
  work_type?: string;
  task?: string;
  requester?: string;
  request_date?: string;
  work_date?: string;
  it_manager?: string;
  cns_manager?: string;
  developer?: string;
  content?: string;
  result?: string;
  month?: string;
}

interface BusinessInquiryRow {
  document_type?: 'dashboard' | 'plan';
  inquiry_method?: string;
  inquiry_type?: string;
  department?: string;
  inquiry_content?: string;
  requester?: string;
  request_date?: string;
  response_date?: string;
  it_manager?: string;
  cns_manager?: string;
  developer?: string;
}

// 엑셀 파일에서 SM Activity 데이터 추출
export const parseSMActivitiesFromExcel = (file: File): Promise<Omit<SMActivity, 'id' | 'created_at' | 'number'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as SMActivityRow[];

        const activities = jsonData.map((row: SMActivityRow) => ({
          document_type: row.document_type || 'dashboard',
          category: row.category || 'regular',
          work_type: row.work_type || '',
          task: row.task || '',
          requester: row.requester || '',
          request_date: row.request_date || new Date().toISOString().split('T')[0],
          work_date: row.work_date || new Date().toISOString().split('T')[0],
          it_manager: row.it_manager || '한상욱',
          cns_manager: row.cns_manager || '한상명',
          developer: row.developer || '위승빈',
          content: row.content || '',
          result: row.result || '',
          month: row.month || new Date().toISOString().split('-')[1],
        }));

        resolve(activities);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// 엑셀 파일에서 현업문의 데이터 추출
export const parseBusinessInquiriesFromExcel = (file: File): Promise<Omit<BusinessInquiry, 'id' | 'created_at' | 'updated_at'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as BusinessInquiryRow[];

        const inquiries = jsonData.map((row: BusinessInquiryRow) => ({
          document_type: (row.document_type as 'dashboard' | 'plan') || 'dashboard',
          inquiry_method: row.inquiry_method || '',
          inquiry_type: row.inquiry_type || '',
          department: row.department || '',
          inquiry_content: row.inquiry_content || '',
          requester: row.requester || '',
          request_date: row.request_date || new Date().toISOString().split('T')[0],
          response_date: row.response_date || new Date().toISOString().split('T')[0],
          it_manager: row.it_manager || '한상욱',
          cns_manager: row.cns_manager || '이정인',
          developer: row.developer || '위승빈',
        }));

        resolve(inquiries);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// SM Activity 데이터를 엑셀 파일로 변환하여 다운로드
export const downloadSMActivitiesAsExcel = (activities: SMActivity[], documentType: 'dashboard' | 'plan' = 'dashboard', filename = 'sm-activities.xlsx') => {
  // 활동 필터링 (문서 유형에 따라)
  const filteredActivities = activities.filter(activity => activity.document_type === documentType);
  
  // 화면에 표시되는 형식으로 데이터 변환
  const formattedData = filteredActivities.map(activity => {
    return {
      'NO': activity.number,
      '연월': activity.month,
      '구분': activity.category === 'regular' ? '정기' : '비정기',
      '작업유형': activity.work_type,
      'TASK': activity.task,
      '요청일': new Date(activity.request_date).toLocaleDateString(),
      '작업일': new Date(activity.work_date).toLocaleDateString(),
      '요청자': activity.requester,
      'IT': activity.it_manager,
      'CNS': activity.cns_manager,
      '개발자': activity.developer,
      '내용': activity.content,
      '결과': activity.result
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  
  // 문서 유형에 따라 시트 이름 설정
  const sheetName = documentType === 'dashboard' ? 'SM Activity - 대시보드' : 'SM Activity - PLAN';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 열 너비 자동 조정
  const columnWidths = [
    { wch: 5 },  // NO
    { wch: 8 },  // 연월
    { wch: 8 },  // 구분
    { wch: 15 }, // 작업유형
    { wch: 30 }, // TASK
    { wch: 12 }, // 요청일
    { wch: 12 }, // 작업일
    { wch: 10 }, // 요청자
    { wch: 10 }, // IT
    { wch: 10 }, // CNS
    { wch: 10 }, // 개발자
    { wch: 40 }, // 내용
    { wch: 10 }  // 결과
  ];
  
  worksheet['!cols'] = columnWidths;
  
  XLSX.writeFile(workbook, filename);
};

// 현업문의 데이터를 엑셀 파일로 변환하여 다운로드
export const downloadBusinessInquiriesAsExcel = (inquiries: BusinessInquiry[], documentType: 'dashboard' | 'plan' = 'dashboard', filename = 'business-inquiries.xlsx') => {
  // 문의 필터링 (문서 유형에 따라)
  const filteredInquiries = inquiries.filter(inquiry => inquiry.document_type === documentType);
  
  // 화면에 표시되는 형식으로 데이터 변환
  const formattedData = filteredInquiries.map(inquiry => {
    return {
      '문의방법': inquiry.inquiry_method,
      '문의유형': inquiry.inquiry_type,
      '요청부서': inquiry.department,
      '문의사항': inquiry.inquiry_content,
      '요청자': inquiry.requester,
      '요청일': new Date(inquiry.request_date).toLocaleDateString(),
      '답변일': new Date(inquiry.response_date).toLocaleDateString(),
      'IT 담당자': inquiry.it_manager,
      'CNS 담당자': inquiry.cns_manager,
      '개발자': inquiry.developer
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  
  // 문서 유형에 따라 시트 이름 설정
  const sheetName = documentType === 'dashboard' ? '현업문의 - 대시보드' : '현업문의 - PLAN';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 열 너비 자동 조정
  const columnWidths = [
    { wch: 12 }, // 문의방법
    { wch: 12 }, // 문의유형
    { wch: 12 }, // 요청부서
    { wch: 40 }, // 문의사항
    { wch: 10 }, // 요청자
    { wch: 12 }, // 요청일
    { wch: 12 }, // 답변일
    { wch: 10 }, // IT 담당자
    { wch: 10 }, // CNS 담당자
    { wch: 10 }  // 개발자
  ];
  
  worksheet['!cols'] = columnWidths;
  
  XLSX.writeFile(workbook, filename);
};

// SM Activity 샘플 템플릿 다운로드
export const downloadSMActivityTemplate = (documentType: 'dashboard' | 'plan' = 'dashboard', filename = 'sm-activity-template.xlsx') => {
  const today = new Date().toISOString().split('T')[0];
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}${month}`;
  
  const template = [
    {
      'NO': '',
      '연월': yearMonth,
      '구분': '정기',
      '작업유형': '',
      'TASK': '',
      '요청일': today,
      '작업일': today,
      '요청자': '',
      'IT': '한상욱',
      'CNS': '한상명',
      '개발자': '위승빈',
      '내용': '',
      '결과': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  
  // 문서 유형에 따라 시트 이름 설정
  const sheetName = documentType === 'dashboard' ? 'SM Activity - 대시보드 템플릿' : 'SM Activity - PLAN 템플릿';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 열 너비 자동 조정
  const columnWidths = [
    { wch: 5 },  // NO
    { wch: 8 },  // 연월
    { wch: 8 },  // 구분
    { wch: 15 }, // 작업유형
    { wch: 30 }, // TASK
    { wch: 12 }, // 요청일
    { wch: 12 }, // 작업일
    { wch: 10 }, // 요청자
    { wch: 10 }, // IT
    { wch: 10 }, // CNS
    { wch: 10 }, // 개발자
    { wch: 40 }, // 내용
    { wch: 10 }  // 결과
  ];
  
  worksheet['!cols'] = columnWidths;
  
  XLSX.writeFile(workbook, filename);
};

// 현업문의 샘플 템플릿 다운로드
export const downloadBusinessInquiryTemplate = (filename = 'business-inquiry-template.xlsx') => {
  const template: Partial<BusinessInquiry>[] = [
    {
      document_type: 'dashboard',
      inquiry_method: '예시: 이메일',
      inquiry_type: '예시: 기능 문의',
      department: '예시: 마케팅팀',
      inquiry_content: '예시: 대시보드 접근 권한 요청',
      requester: '예시: 홍길동',
      request_date: new Date().toISOString().split('T')[0],
      response_date: new Date().toISOString().split('T')[0],
      it_manager: '한상욱',
      cns_manager: '이정인',
      developer: '위승빈'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Inquiry Template');
  XLSX.writeFile(workbook, filename);
}; 