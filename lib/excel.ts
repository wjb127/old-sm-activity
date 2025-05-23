import * as XLSX from 'xlsx';
import { SMActivity, BusinessInquiry } from '@/types/database';

interface SMActivityRow {
  document_type?: 'dashboard' | 'plan';
  task_type?: 'regular' | 'irregular';
  work_type?: string;
  title?: string;
  requester?: string;
  request_date?: string;
  work_date?: string;
  it_manager?: string;
  cns_manager?: string;
  developer?: string;
  result?: string;
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
export const parseSMActivitiesFromExcel = (file: File): Promise<Omit<SMActivity, 'id' | 'created_at' | 'updated_at'>[]> => {
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
          document_type: (row.document_type as 'dashboard' | 'plan') || 'dashboard',
          task_type: (row.task_type as 'regular' | 'irregular') || 'regular',
          work_type: row.work_type || '',
          title: row.title || '',
          requester: row.requester || '',
          request_date: row.request_date || new Date().toISOString().split('T')[0],
          work_date: row.work_date || new Date().toISOString().split('T')[0],
          it_manager: row.it_manager || '한상욱',
          cns_manager: row.cns_manager || '한상명',
          developer: row.developer || '위승빈',
          result: row.result || '',
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
export const downloadSMActivitiesAsExcel = (activities: SMActivity[], filename = 'sm-activities.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(activities);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SM Activities');
  XLSX.writeFile(workbook, filename);
};

// 현업문의 데이터를 엑셀 파일로 변환하여 다운로드
export const downloadBusinessInquiriesAsExcel = (inquiries: BusinessInquiry[], filename = 'business-inquiries.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(inquiries);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Inquiries');
  XLSX.writeFile(workbook, filename);
};

// SM Activity 샘플 템플릿 다운로드
export const downloadSMActivityTemplate = (filename = 'sm-activity-template.xlsx') => {
  const template: Partial<SMActivity>[] = [
    {
      document_type: 'dashboard',
      task_type: 'regular',
      work_type: '예시: 대시보드 업데이트',
      title: '예시: 월간 대시보드 업데이트',
      requester: '예시: 홍길동',
      request_date: new Date().toISOString().split('T')[0],
      work_date: new Date().toISOString().split('T')[0],
      it_manager: '한상욱',
      cns_manager: '한상명',
      developer: '위승빈',
      result: '예시: 완료'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SM Activity Template');
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