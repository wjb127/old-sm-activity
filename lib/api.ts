import { SMActivity, BusinessInquiry } from '@/types/database';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 헤더 설정 함수
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };
};

// API 요청 로그 함수
const logApiRequest = (method: string, url: string, body?: Record<string, unknown>) => {
  console.log(`API ${method} 요청:`, { url, body });
};

// API 응답 로그 함수
const logApiResponse = (method: string, url: string, response: unknown) => {
  console.log(`API ${method} 응답:`, { url, response });
};

// SM Activity 관련 API 함수
export const fetchSMActivities = async (): Promise<SMActivity[]> => {
  const url = `${SUPABASE_URL}/rest/v1/sm_activities?order=request_date.desc&select=*`;
  
  logApiRequest('GET', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    logApiResponse('GET', url, data);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('fetchSMActivities 오류:', error);
    throw error;
  }
};

export const createSMActivity = async (activity: Omit<SMActivity, 'id' | 'created_at' | 'updated_at'>): Promise<SMActivity> => {
  const url = `${SUPABASE_URL}/rest/v1/sm_activities`;
  
  logApiRequest('POST', url, activity);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(activity)
    });
    
    const data = await response.json();
    logApiResponse('POST', url, data);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data[0];
  } catch (error) {
    console.error('createSMActivity 오류:', error);
    throw error;
  }
};

export const updateSMActivity = async (id: number, activity: Partial<SMActivity>): Promise<SMActivity> => {
  const url = `${SUPABASE_URL}/rest/v1/sm_activities?id=eq.${id}`;
  
  logApiRequest('PATCH', url, activity);
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(activity)
    });
    
    const data = await response.json();
    logApiResponse('PATCH', url, data);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data[0];
  } catch (error) {
    console.error('updateSMActivity 오류:', error);
    throw error;
  }
};

export const deleteSMActivity = async (id: number): Promise<void> => {
  const url = `${SUPABASE_URL}/rest/v1/sm_activities?id=eq.${id}`;
  
  logApiRequest('DELETE', url);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const data = await response.json();
      logApiResponse('DELETE', url, data);
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    logApiResponse('DELETE', url, { success: true });
  } catch (error) {
    console.error('deleteSMActivity 오류:', error);
    throw error;
  }
};

// 현업문의 관련 API 함수
export const fetchBusinessInquiries = async (): Promise<BusinessInquiry[]> => {
  const url = `${SUPABASE_URL}/rest/v1/business_inquiries?order=request_date.desc&select=*`;
  
  logApiRequest('GET', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    logApiResponse('GET', url, data);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('fetchBusinessInquiries 오류:', error);
    throw error;
  }
};

export const createBusinessInquiry = async (inquiry: Omit<BusinessInquiry, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessInquiry> => {
  const url = `${SUPABASE_URL}/rest/v1/business_inquiries`;
  
  logApiRequest('POST', url, inquiry);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(inquiry)
    });
    
    const data = await response.json();
    logApiResponse('POST', url, data);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data[0];
  } catch (error) {
    console.error('createBusinessInquiry 오류:', error);
    throw error;
  }
};

export const updateBusinessInquiry = async (id: number, inquiry: Partial<BusinessInquiry>): Promise<BusinessInquiry> => {
  const url = `${SUPABASE_URL}/rest/v1/business_inquiries?id=eq.${id}`;
  
  logApiRequest('PATCH', url, inquiry);
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(inquiry)
    });
    
    const data = await response.json();
    logApiResponse('PATCH', url, data);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data[0];
  } catch (error) {
    console.error('updateBusinessInquiry 오류:', error);
    throw error;
  }
};

export const deleteBusinessInquiry = async (id: number): Promise<void> => {
  const url = `${SUPABASE_URL}/rest/v1/business_inquiries?id=eq.${id}`;
  
  logApiRequest('DELETE', url);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const data = await response.json();
      logApiResponse('DELETE', url, data);
      throw new Error(`API 오류: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    logApiResponse('DELETE', url, { success: true });
  } catch (error) {
    console.error('deleteBusinessInquiry 오류:', error);
    throw error;
  }
}; 