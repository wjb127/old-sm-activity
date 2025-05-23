'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  downloadSMActivityTemplate,
  downloadBusinessInquiryTemplate,
  parseSMActivitiesFromExcel,
  parseBusinessInquiriesFromExcel
} from '@/lib/excel';

type DataRow = Record<string, string | number | boolean | null>;

interface ExcelUploaderProps {
  type: 'sm-activity' | 'business-inquiry';
  onUpload: (data: DataRow[]) => Promise<void>;
  onComplete: () => void;
}

export default function ExcelUploader({ type, onUpload, onComplete }: ExcelUploaderProps) {
  const [previewData, setPreviewData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 파일 선택 처리
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      if (type === 'sm-activity') {
        const data = await parseSMActivitiesFromExcel(file);
        setPreviewData(data);
      } else {
        const data = await parseBusinessInquiriesFromExcel(file);
        setPreviewData(data);
      }
    } catch (error) {
      console.error('엑셀 파일 처리 중 오류 발생:', error);
      alert('엑셀 파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 템플릿 다운로드 처리
  const handleTemplateDownload = () => {
    if (type === 'sm-activity') {
      downloadSMActivityTemplate();
    } else {
      downloadBusinessInquiryTemplate();
    }
  };

  // 일괄 업로드 처리
  const handleBulkUpload = async () => {
    if (previewData.length === 0) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(previewData);
      alert('데이터가 성공적으로 업로드되었습니다.');
      setPreviewData([]);
      onComplete();
    } catch (error) {
      console.error('데이터 업로드 중 오류 발생:', error);
      alert('데이터 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 테이블 헤더 생성
  const renderTableHeaders = () => {
    if (previewData.length === 0) return null;

    const headers = Object.keys(previewData[0]);
    return (
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
    );
  };

  // 테이블 데이터 생성
  const renderTableRows = () => {
    if (previewData.length === 0) return (
      <TableRow>
        <TableCell colSpan={10} className="text-center py-4">
          데이터가 없습니다. 엑셀 파일을 업로드해주세요.
        </TableCell>
      </TableRow>
    );

    return previewData.map((row, index) => (
      <TableRow key={index}>
        {Object.values(row).map((value, i) => (
          <TableCell key={i}>
            {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <Button variant="outline" onClick={handleTemplateDownload}>
            샘플 템플릿 다운로드
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isLoading || isUploading}
            />
            <Button variant="outline" disabled={isLoading || isUploading}>
              {isLoading ? '처리 중...' : '파일 선택'}
            </Button>
          </div>
          
          <Button 
            onClick={handleBulkUpload} 
            disabled={previewData.length === 0 || isUploading}
          >
            {isUploading ? '업로드 중...' : '일괄 추가'}
          </Button>
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            {renderTableHeaders()}
            <TableBody>
              {renderTableRows()}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 