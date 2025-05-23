'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Layout from '@/components/layout';
import ExcelUploader from '@/components/excel-uploader';
import { BusinessInquiry } from '@/types/database';
import { fetchBusinessInquiries, createBusinessInquiry, updateBusinessInquiry, deleteBusinessInquiry } from '@/lib/api';
import { downloadBusinessInquiriesAsExcel } from '@/lib/excel';

export default function InquiriesPage() {
  // 상태 관리
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState<Partial<BusinessInquiry> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(inquiries.length / itemsPerPage);
  const currentInquiries = inquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 데이터 로드
  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBusinessInquiries();
      setInquiries(data);
    } catch (error) {
      console.error('현업문의 로드 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // 답변일 자동 설정 (요청일 + 1일)
  const handleRequestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentInquiry) return;
    
    const requestDate = e.target.value;
    const requestDateObj = new Date(requestDate);
    const responseDateObj = new Date(requestDateObj);
    responseDateObj.setDate(requestDateObj.getDate() + 1);
    
    const responseDate = responseDateObj.toISOString().split('T')[0];
    
    setCurrentInquiry({
      ...currentInquiry,
      request_date: requestDate,
      response_date: responseDate
    });
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentInquiry) return;
    
    try {
      console.log('현업문의 저장 시작:', currentInquiry);
      
      if (isEditing && currentInquiry.id) {
        console.log(`ID ${currentInquiry.id}의 현업문의 수정 시도`);
        const result = await updateBusinessInquiry(currentInquiry.id, currentInquiry);
        console.log('현업문의 수정 결과:', result);
      } else {
        console.log('새 현업문의 생성 시도');
        const result = await createBusinessInquiry(currentInquiry as Omit<BusinessInquiry, 'id' | 'created_at' | 'updated_at'>);
        console.log('현업문의 생성 결과:', result);
      }
      
      setIsDialogOpen(false);
      loadInquiries();
    } catch (error) {
      console.error('현업문의 저장 중 오류 발생:', error);
      
      // 오류 상세 정보 출력
      if (error instanceof Error) {
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
      } else {
        console.error('알 수 없는 오류 타입:', typeof error);
      }
      
      alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 삭제 처리
  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 문의를 삭제하시겠습니까?')) {
      try {
        await deleteBusinessInquiry(id);
        loadInquiries();
      } catch (error) {
        console.error('현업문의 삭제 중 오류 발생:', error);
      }
    }
  };

  // 수정 처리
  const handleEdit = (inquiry: BusinessInquiry) => {
    setCurrentInquiry(inquiry);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // 엑셀 파일 다운로드
  const handleExport = () => {
    downloadBusinessInquiriesAsExcel(inquiries);
  };

  // 엑셀 업로드 다이얼로그 열기
  const openExcelDialog = () => {
    setIsExcelDialogOpen(true);
  };

  // 엑셀 데이터 일괄 업로드 처리
  const handleBulkUpload = async (data: Record<string, string | number | boolean | null>[]) => {
    const inquiries = data as Omit<BusinessInquiry, 'id' | 'created_at' | 'updated_at'>[];
    
    for (const inquiry of inquiries) {
      await createBusinessInquiry(inquiry);
    }
    
    return Promise.resolve();
  };

  // 신규 생성 다이얼로그 열기
  const openCreateDialog = () => {
    setCurrentInquiry({
      document_type: 'dashboard',
      inquiry_method: '',
      inquiry_type: '',
      department: '',
      inquiry_content: '',
      requester: '',
      request_date: new Date().toISOString().split('T')[0],
      response_date: new Date().toISOString().split('T')[0],
      it_manager: '한상욱',
      cns_manager: '이정인',
      developer: '위승빈'
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">현업문의 관리</h1>
          <div className="flex gap-2">
            <Button onClick={openCreateDialog}>신규 등록</Button>
            <Button variant="outline" onClick={openExcelDialog}>엑셀 관리</Button>
            <Button variant="outline" onClick={handleExport}>데이터 다운로드</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : (
          <>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>문서 유형</TableHead>
                    <TableHead>문의방법</TableHead>
                    <TableHead>문의유형</TableHead>
                    <TableHead>요청부서</TableHead>
                    <TableHead>문의사항</TableHead>
                    <TableHead>요청자</TableHead>
                    <TableHead>요청일</TableHead>
                    <TableHead>답변일</TableHead>
                    <TableHead>IT 담당자</TableHead>
                    <TableHead>CNS 담당자</TableHead>
                    <TableHead>개발자</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInquiries.length > 0 ? (
                    currentInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell>
                          {inquiry.document_type === 'dashboard' ? 'SM Activity - 대시보드' : 'SM Activity - Plan'}
                        </TableCell>
                        <TableCell>{inquiry.inquiry_method}</TableCell>
                        <TableCell>{inquiry.inquiry_type}</TableCell>
                        <TableCell>{inquiry.department}</TableCell>
                        <TableCell>{inquiry.inquiry_content}</TableCell>
                        <TableCell>{inquiry.requester}</TableCell>
                        <TableCell>{new Date(inquiry.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(inquiry.response_date).toLocaleDateString()}</TableCell>
                        <TableCell>{inquiry.it_manager}</TableCell>
                        <TableCell>{inquiry.cns_manager}</TableCell>
                        <TableCell>{inquiry.developer}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(inquiry)}>
                              수정
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(inquiry.id)}>
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-4">
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
        )}
      </div>

      {/* 현업문의 등록/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? '현업문의 수정' : '현업문의 등록'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">문서 선택</Label>
                <Select
                  value={currentInquiry?.document_type || 'dashboard'}
                  onValueChange={(value) => setCurrentInquiry(prev => ({ ...prev, document_type: value as 'dashboard' | 'plan' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="문서 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">SM Activity - 대시보드</SelectItem>
                    <SelectItem value="plan">SM Activity - Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiry_method">문의방법</Label>
                <Input
                  id="inquiry_method"
                  value={currentInquiry?.inquiry_method || ''}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, inquiry_method: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiry_type">문의유형</Label>
                <Input
                  id="inquiry_type"
                  value={currentInquiry?.inquiry_type || ''}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, inquiry_type: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">요청부서</Label>
                <Input
                  id="department"
                  value={currentInquiry?.department || ''}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="inquiry_content">문의사항</Label>
                <Input
                  id="inquiry_content"
                  value={currentInquiry?.inquiry_content || ''}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, inquiry_content: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requester">요청자</Label>
                <Input
                  id="requester"
                  value={currentInquiry?.requester || ''}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, requester: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_date">요청일</Label>
                <Input
                  id="request_date"
                  type="date"
                  value={currentInquiry?.request_date || ''}
                  onChange={handleRequestDateChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_date">답변일</Label>
                <Input
                  id="response_date"
                  type="date"
                  value={currentInquiry?.response_date || ''}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, response_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="it_manager">IT 담당자</Label>
                <Input
                  id="it_manager"
                  value={currentInquiry?.it_manager || '한상욱'}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, it_manager: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cns_manager">CNS 담당자</Label>
                <Input
                  id="cns_manager"
                  value={currentInquiry?.cns_manager || '이정인'}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, cns_manager: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developer">개발자</Label>
                <Input
                  id="developer"
                  value={currentInquiry?.developer || '위승빈'}
                  onChange={(e) => setCurrentInquiry(prev => ({ ...prev, developer: e.target.value }))}
                />
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
            type="business-inquiry"
            onUpload={handleBulkUpload}
            onComplete={() => {
              setIsExcelDialogOpen(false);
              loadInquiries();
            }}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
} 