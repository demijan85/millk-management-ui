import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project details
const SUPABASE_URL = 'https://ypcfpsjdjmwinikldjtx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY2Zwc2pkam13aW5pa2xkanR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MjM5MjcsImV4cCI6MjA1MzM5OTkyN30.KbEChZsidNdT6BuSwGlaiawJpXA0P_TWc0EitEg34P4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
