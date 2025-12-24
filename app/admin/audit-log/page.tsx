'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface AuditLog {
  id: string;
  date: string;
  admin: string;
  action: string;
  userEmail: string;
  oldTier: string;
  newTier: string;
  reason: string;
  metadata: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        action: actionFilter,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/admin/audit-log?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit log');
      }

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      showToast('Failed to load audit log', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, actionFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Admin', 'Action', 'User Email', 'Old Tier', 'New Tier', 'Reason'];
    const rows = logs.map(log => [
      new Date(log.date).toLocaleString(),
      log.admin,
      log.action,
      log.userEmail,
      log.oldTier,
      log.newTier,
      log.reason || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View all admin actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Actions</option>
              <option value="grant_access">Grant Access</option>
              <option value="revoke_access">Revoke Access</option>
              <option value="update_tier">Update Tier</option>
              <option value="bulk_action">Bulk Action</option>
            </select>
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
            <div className="flex items-end">
              <Button onClick={handleExportCSV} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Audit Log Entries ({pagination.total.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading audit log...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No audit log entries found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Admin</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Action</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">User Email</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Old Tier → New Tier</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="p-4 text-sm text-gray-900 dark:text-white">
                          {new Date(log.date).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm text-gray-900 dark:text-white">{log.admin}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-900 dark:text-white">{log.userEmail}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          {log.oldTier} → {log.newTier}
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                          {log.reason || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

