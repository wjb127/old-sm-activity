export interface SMActivity {
  id: number;
  created_at: string;
  updated_at: string;
  document_type: 'dashboard' | 'plan'; // 문서 유형 (대시보드, Plan)
  task_type: 'regular' | 'irregular'; // 구분 (정기/비정기)
  work_type: string; // 작업유형
  title: string; // TASK 제목
  requester: string; // 요청자
  request_date: string; // 요청일
  work_date: string; // 작업일
  it_manager: string; // IT 담당자
  cns_manager: string; // CNS 담당자
  developer: string; // 개발자
  result: string; // 결과
}

export interface BusinessInquiry {
  id: number;
  created_at: string;
  updated_at: string;
  document_type: 'dashboard' | 'plan'; // 문서 유형 (대시보드, Plan)
  inquiry_method: string; // 문의방법
  inquiry_type: string; // 문의유형
  department: string; // 요청부서
  inquiry_content: string; // 문의사항
  requester: string; // 요청자
  request_date: string; // 요청일
  response_date: string; // 답변일
  it_manager: string; // IT 담당자
  cns_manager: string; // CNS 담당자
  developer: string; // 개발자
} 