import { supabase } from './supabase';
import { SMActivity, BusinessInquiry } from '@/types/database';

// SM Activity 관련 API 함수
export const fetchSMActivities = async (): Promise<SMActivity[]> => {
  const { data, error } = await supabase
    .from('sm_activities')
    .select('*')
    .order('request_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createSMActivity = async (activity: Omit<SMActivity, 'id' | 'created_at' | 'updated_at'>): Promise<SMActivity> => {
  const { data, error } = await supabase
    .from('sm_activities')
    .insert([activity])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSMActivity = async (id: number, activity: Partial<SMActivity>): Promise<SMActivity> => {
  const { data, error } = await supabase
    .from('sm_activities')
    .update(activity)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSMActivity = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('sm_activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// 현업문의 관련 API 함수
export const fetchBusinessInquiries = async (): Promise<BusinessInquiry[]> => {
  const { data, error } = await supabase
    .from('business_inquiries')
    .select('*')
    .order('request_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createBusinessInquiry = async (inquiry: Omit<BusinessInquiry, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessInquiry> => {
  const { data, error } = await supabase
    .from('business_inquiries')
    .insert([inquiry])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBusinessInquiry = async (id: number, inquiry: Partial<BusinessInquiry>): Promise<BusinessInquiry> => {
  const { data, error } = await supabase
    .from('business_inquiries')
    .update(inquiry)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBusinessInquiry = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('business_inquiries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}; 