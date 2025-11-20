import { supabase } from '../lib/supabaseClient';

export type ActivityAction = 
  | 'login'
  | 'logout'
  | 'essay_submit'
  | 'essay_edit'
  | 'essay_delete'
  | 'rubric_create'
  | 'rubric_edit'
  | 'rubric_delete'
  | 'student_add'
  | 'student_edit'
  | 'student_delete'
  | 'feedback_generate'
  | 'feedback_export'
  | 'batch_process'
  | 'settings_update'
  | 'admin_access';

interface ActivityDetails {
  [key: string]: any;
}

/**
 * Log user activity for audit trail and analytics
 */
export async function logActivity(
  action: ActivityAction,
  details?: ActivityDetails
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log activity: No user authenticated');
      return;
    }

    // Get IP address (optional - may not work in all environments)
    let ipAddress = null;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (error) {
      // IP fetch failed, continue without it
    }

    // Get user agent
    const userAgent = navigator.userAgent;

    // Insert activity log
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action_type: action,
        action_details: details || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
}

/**
 * Fetch activity logs for current user
 */
export async function getUserActivityLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

/**
 * Fetch all activity logs (admin only)
 */
export async function getAllActivityLogs(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('admin_recent_activity')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all activity logs:', error);
    return [];
  }
}

/**
 * Get activity statistics (admin only)
 */
export async function getActivityStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('action_type, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Group by action type
    const stats: Record<string, number> = {};
    data?.forEach((log) => {
      stats[log.action_type] = (stats[log.action_type] || 0) + 1;
    });

    return {
      total: data?.length || 0,
      byAction: stats,
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return { total: 0, byAction: {} };
  }
}
