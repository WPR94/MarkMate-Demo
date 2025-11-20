-- Activity Logs System
-- Tracks user actions for security, audit, and analytics

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'login', 'essay_submit', 'rubric_create', 'student_add', etc.
  action_details jsonb, -- Additional context (e.g., essay_id, rubric_name)
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON public.activity_logs(user_id, action_type);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own activity logs"
  ON public.activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create a function to log activity (can be called from app or triggers)
CREATE OR REPLACE FUNCTION log_user_activity(
  p_action_type text,
  p_action_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action_type,
    action_details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_action_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create triggers to auto-log certain actions

-- Log essay submissions
CREATE OR REPLACE FUNCTION trigger_log_essay_submit()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_user_activity(
    'essay_submit',
    jsonb_build_object(
      'essay_id', NEW.id,
      'essay_title', NEW.title,
      'word_count', NEW.word_count
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_essay_submit
  AFTER INSERT ON public.essays
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_essay_submit();

-- Log rubric creation
CREATE OR REPLACE FUNCTION trigger_log_rubric_create()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_user_activity(
    'rubric_create',
    jsonb_build_object(
      'rubric_id', NEW.id,
      'rubric_name', NEW.name,
      'subject', NEW.subject
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_rubric_create
  AFTER INSERT ON public.rubrics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_rubric_create();

-- Log student addition
CREATE OR REPLACE FUNCTION trigger_log_student_add()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_user_activity(
    'student_add',
    jsonb_build_object(
      'student_id', NEW.id,
      'student_name', NEW.name,
      'class_section', NEW.class_section
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_student_add
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_student_add();

-- Create view for recent activity summary
CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT 
  al.id,
  al.action_type,
  al.action_details,
  al.created_at,
  p.email as user_email,
  p.full_name as user_name
FROM public.activity_logs al
LEFT JOIN public.profiles p ON p.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 100;

-- Grant access to authenticated users
GRANT SELECT ON admin_recent_activity TO authenticated;

-- Comments for clarity
COMMENT ON TABLE public.activity_logs IS 'Audit trail of all user actions in the platform';
COMMENT ON FUNCTION log_user_activity IS 'Helper function to log user activity from application code';
COMMENT ON VIEW admin_recent_activity IS 'Recent activity across all users for admin dashboard';
