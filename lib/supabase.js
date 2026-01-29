import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mlzavdukbvxwhxetgftj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semF2ZHVrYnZ4d2h4ZXRnZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Nzc4OTAsImV4cCI6MjA4NTI1Mzg5MH0.fQp_VY1-omgx8uqaGtauugkhxdxXoKBm3VuzbMdumqM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);