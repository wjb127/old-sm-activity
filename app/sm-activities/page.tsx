'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/layout';
import ExcelUploader from '@/components/excel-uploader';
import { SMActivity } from '@/types/database';
import { fetchSMActivities, createSMActivity, updateSMActivity, deleteSMActivity } from '@/lib/api';
import { downloadSMActivitiesAsExcel } from '@/lib/excel';

export default function SMActivitiesPage() {
  // 상태 관리
  const [activities, setActivities] = useState<SMActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<SMActivity> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan'>('dashboard');
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 활성 탭에 따라 필터링된 활동 목록
  const filteredActivities = activities.filter(activity => activity.document_type === activeTab);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 데이터 로드
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSMActivities();
      setActivities(data);
    } catch (error) {
      console.error('SM Activity 로드 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // 작업일 자동 설정 (요청일과 동일하게)
  const handleRequestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentActivity) return;
    
    const requestDate = e.target.value;
    const requestDateObj = new Date(requestDate);
    
    // 연월 추출 (YYYYMM)
    const year = requestDateObj.getFullYear();
    const month = String(requestDateObj.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    setCurrentActivity({
      ...currentActivity,
      request_date: requestDate,
      work_date: requestDate, // 작업일을 요청일과 동일하게 설정
      month: yearMonth // 연월 자동 설정 (YYYYMM)
    });
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('폼 제출 버튼 클릭');
    
    if (!currentActivity) return;
    
    try {
      console.log('===== SM Activity 저장 시작 =====');
      console.log('저장할 데이터:', JSON.stringify(currentActivity, null, 2));
      console.log('데이터 타입:', isEditing ? '수정' : '신규 등록');
      
      if (isEditing && currentActivity.id) {
        console.log(`ID ${currentActivity.id}의 SM Activity 수정 시도`);
        console.log('API 호출 전 데이터:', currentActivity);
        const result = await updateSMActivity(currentActivity.id, currentActivity);
        console.log('SM Activity 수정 결과:', result);
        console.log('수정 API 응답:', JSON.stringify(result, null, 2));
      } else {
        console.log('새 SM Activity 생성 시도');
        console.log('API 호출 전 데이터:', currentActivity);
        const result = await createSMActivity(currentActivity as Omit<SMActivity, 'id' | 'created_at' | 'updated_at'>);
        console.log('SM Activity 생성 결과:', result);
        console.log('생성 API 응답:', JSON.stringify(result, null, 2));
      }
      
      console.log('===== SM Activity 저장 완료 =====');
      setIsDialogOpen(false);
      loadActivities();
    } catch (error) {
      console.error('===== SM Activity 저장 중 오류 발생 =====');
      console.error('오류 발생 시점 데이터:', currentActivity);
      
      // 오류 상세 정보 출력
      if (error instanceof Error) {
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
      } else {
        console.error('알 수 없는 오류 타입:', typeof error);
        console.error('오류 내용:', error);
      }
      
      alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 삭제 처리
  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 활동을 삭제하시겠습니까?')) {
      try {
        await deleteSMActivity(id);
        loadActivities();
      } catch (error) {
        console.error('SM Activity 삭제 중 오류 발생:', error);
      }
    }
  };

  // 수정 처리
  const handleEdit = (activity: SMActivity) => {
    setCurrentActivity(activity);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // 엑셀 파일 다운로드
  const handleExport = () => {
    downloadSMActivitiesAsExcel(activities, activeTab);
  };

  // 엑셀 업로드 다이얼로그 열기
  const openExcelDialog = () => {
    setIsExcelDialogOpen(true);
  };

  // 엑셀 데이터 일괄 업로드 처리
  const handleBulkUpload = async (data: Record<string, string | number | boolean | null>[]) => {
    const activities = data as Omit<SMActivity, 'id' | 'created_at' | 'updated_at'>[];
    
    for (const activity of activities) {
      await createSMActivity(activity);
    }
    
    return Promise.resolve();
  };

  // 신규 생성 다이얼로그 열기
  const openCreateDialog = () => {
    console.log('신규 등록 버튼 클릭');
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    setCurrentActivity({
      document_type: activeTab,
      category: 'regular',
      work_type: '',
      task: '',
      requester: '',
      request_date: today,
      work_date: today,
      it_manager: '한상욱',
      cns_manager: '한상명',
      developer: '위승빈',
      content: '', // TASK가 입력되면 자동으로 복사됨
      result: '',
      month: yearMonth
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SM Activity 관리</h1>
          <div className="flex gap-2">
            <Button onClick={openCreateDialog}>신규 등록</Button>
            <Button variant="outline" onClick={openExcelDialog}>엑셀 관리</Button>
            <Button variant="outline" onClick={handleExport}>데이터 다운로드</Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(value) => setActiveTab(value as 'dashboard' | 'plan')}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="plan">PLAN</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            {renderActivityTable()}
          </TabsContent>
          <TabsContent value="plan">
            {renderActivityTable()}
          </TabsContent>
        </Tabs>
      </div>

      {/* 활동 등록/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'SM Activity 수정' : 'SM Activity 등록'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">문서 유형</Label>
                <Select
                  value={currentActivity?.document_type || activeTab}
                  onValueChange={(value) => setCurrentActivity(prev => ({ ...prev, document_type: value as 'dashboard' | 'plan' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="문서 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">대시보드</SelectItem>
                    <SelectItem value="plan">PLAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">구분</Label>
                <Select
                  value={currentActivity?.category || 'regular'}
                  onValueChange={(value) => setCurrentActivity(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="구분 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">정기</SelectItem>
                    <SelectItem value="irregular">비정기</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_type">작업유형</Label>
                <Select
                  value={currentActivity?.work_type || ''}
                  onValueChange={(value) => setCurrentActivity(prev => ({ ...prev, work_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="작업유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="조간점검">조간점검</SelectItem>
                    <SelectItem value="시스템운영">시스템운영</SelectItem>
                    <SelectItem value="월정기작업">월정기작업</SelectItem>
                    <SelectItem value="적재">적재</SelectItem>
                    <SelectItem value="재적재">재적재</SelectItem>
                    <SelectItem value="인프라작업">인프라작업</SelectItem>
                    <SelectItem value="SI지원">SI지원</SelectItem>
                    <SelectItem value="ERRC">ERRC</SelectItem>
                    <SelectItem value="CCB">CCB</SelectItem>
                    <SelectItem value="인수인계">인수인계</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-3">
                <Label htmlFor="task">TASK</Label>
                <Textarea
                  id="task"
                  value={currentActivity?.task || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const taskValue = e.target.value;
                    setCurrentActivity(prev => ({ 
                      ...prev, 
                      task: taskValue,
                      content: taskValue // TASK 내용을 content 필드에 자동으로 복사
                    }))
                  }}
                  className="min-h-[100px]"
                  placeholder="TASK 내용을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_date">요청일</Label>
                <Input
                  id="request_date"
                  type="date"
                  value={currentActivity?.request_date || ''}
                  onChange={handleRequestDateChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_date">작업일</Label>
                <Input
                  id="work_date"
                  type="date"
                  value={currentActivity?.work_date || ''}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, work_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requester">요청자</Label>
                <Input
                  id="requester"
                  value={currentActivity?.requester || ''}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, requester: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="it_manager">IT</Label>
                <Input
                  id="it_manager"
                  value={currentActivity?.it_manager || '한상욱'}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, it_manager: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cns_manager">CNS</Label>
                <Input
                  id="cns_manager"
                  value={currentActivity?.cns_manager || '한상명'}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, cns_manager: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developer">개발자</Label>
                <Input
                  id="developer"
                  value={currentActivity?.developer || '위승빈'}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, developer: e.target.value }))}
                />
              </div>

              <div className="space-y-2 col-span-3">
                <Label htmlFor="result">결과</Label>
                <Select
                  value={currentActivity?.result || ''}
                  onValueChange={(value) => setCurrentActivity(prev => ({ ...prev, result: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="결과 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="완료">완료</SelectItem>
                    <SelectItem value="진행중">진행중</SelectItem>
                    <SelectItem value="보류">보류</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">{isEditing ? '수정' : '등록'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 엑셀 관리 다이얼로그 */}
      <Dialog open={isExcelDialogOpen} onOpenChange={setIsExcelDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>엑셀 데이터 관리</DialogTitle>
          </DialogHeader>
          
          <ExcelUploader 
            type="sm-activity"
            onUpload={handleBulkUpload}
            onComplete={() => {
              setIsExcelDialogOpen(false);
              loadActivities();
            }}
            documentType={activeTab}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );

  // 테이블 렌더링 함수
  function renderActivityTable() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p>로딩 중...</p>
        </div>
      );
    }

    return (
      <>
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NO</TableHead>
                <TableHead>연월</TableHead>
                <TableHead>구분</TableHead>
                <TableHead>작업유형</TableHead>
                <TableHead>TASK</TableHead>
                <TableHead>요청일</TableHead>
                <TableHead>작업일</TableHead>
                <TableHead>요청자</TableHead>
                <TableHead>IT</TableHead>
                <TableHead>CNS</TableHead>
                <TableHead>개발자</TableHead>
                <TableHead>내용</TableHead>
                <TableHead>결과</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentActivities.length > 0 ? (
                currentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.number}</TableCell>
                    <TableCell>{activity.month}</TableCell>
                    <TableCell>
                      {activity.category === 'regular' ? '정기' : '비정기'}
                    </TableCell>
                    <TableCell>{activity.work_type}</TableCell>
                    <TableCell>{activity.task}</TableCell>
                    <TableCell>{new Date(activity.request_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(activity.work_date).toLocaleDateString()}</TableCell>
                    <TableCell>{activity.requester}</TableCell>
                    <TableCell>{activity.it_manager}</TableCell>
                    <TableCell>{activity.cns_manager}</TableCell>
                    <TableCell>{activity.developer}</TableCell>
                    <TableCell>{activity.content}</TableCell>
                    <TableCell>{activity.result}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                          수정
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(activity.id)}>
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-4">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </>
    );
  }
} 