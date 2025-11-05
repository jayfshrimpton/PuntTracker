'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchAllFeedback, type Feedback } from '@/lib/api';
import { format } from 'date-fns';
import { Shield } from 'lucide-react';

// UPDATE THIS EMAIL to your admin email
const ADMIN_EMAIL = 'jayfshrimpton@gmail.com'; // Change this to your email

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewing' | 'completed'>('all');

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadFeedback();
    }
  }, [isAdmin, filterStatus]);

  const checkAdmin = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated');
        return;
      }

      setUserEmail(user.email || null);
      
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setError('Access denied. Admin access only.');
      }
    } catch (err) {
      setError('Failed to verify admin status');
    }
  };

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await fetchAllFeedback();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setFeedback(data || []);
      }
    } catch (err) {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeedback =
    filterStatus === 'all'
      ? feedback
      : feedback.filter((item) => item.status === filterStatus);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Shield className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            {error || 'You do not have permission to access this page.'}
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: {userEmail}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-900">Loading feedback...</div>
      </div>
    );
  }

  const statusCounts = {
    all: feedback.length,
    new: feedback.filter((f) => f.status === 'new').length,
    reviewing: feedback.filter((f) => f.status === 'reviewing').length,
    completed: feedback.filter((f) => f.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback Admin</h1>
        <p className="mt-1 text-sm text-gray-900">
          Manage and review all user feedback submissions
        </p>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'reviewing', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Feedback ({filteredFeedback.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredFeedback.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-900">
              No feedback found.
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{item.feedback_type}</span>
                      {' • '}
                      <span>{item.email}</span>
                    </p>
                    <p className="text-gray-900 mb-2 whitespace-pre-wrap">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      User ID: {item.user_id.substring(0, 8)}... • Submitted on{' '}
                      {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

