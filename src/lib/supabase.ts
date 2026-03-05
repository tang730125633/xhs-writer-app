import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface HistoryRecord {
  id: string;
  created_at: string;
  title: string;
  style: string;
  content: string;
  user_id: string;
}
