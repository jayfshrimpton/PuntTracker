'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronLeft, ChevronRight, Shield, UserPlus } from 'lucide-react';
import { GrantAccessModal } from '@/components/admin/GrantAccessModal';
import { GrantAccessByEmailModal } from '@/components/admin/GrantAccessByEmailModal';
import { showToast } from '@/lib/toast';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'elite';
  status: string;
  specialPricing: string | null;
  currentPrice: number | null;
  betsCount: number;
  joinedDate: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [specialPricingFilter, setSpecialPricingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showGrantByEmailModal, setShowGrantByEmailModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        tier: tierFilter,
        specialPricing: specialPricingFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, search, tierFilter, specialPricingFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'elite':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage user subscriptions and access</p>
        </div>
        <Button
          onClick={() => setShowGrantByEmailModal(true)}
          variant="outline"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Grant Access by Email
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
            <select
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={specialPricingFilter}
              onChange={(e) => {
                setSpecialPricingFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Special Pricing</option>
              <option value="beta_tester">Beta Tester</option>
              <option value="founding_member">Founding Member</option>
              <option value="influencer">Influencer</option>
            </select>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="bets_count-desc">Most Bets</option>
              <option value="bets_count-asc">Least Bets</option>
              <option value="tier-desc">Tier (High to Low)</option>
              <option value="tier-asc">Tier (Low to High)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Users ({pagination.total.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tier</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Special Pricing</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Bets</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Joined</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="p-4 text-sm text-gray-900 dark:text-white">{user.email}</td>
                        <td className="p-4 text-sm text-gray-900 dark:text-white">{user.name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(user.tier)}`}>
                            {user.tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          {user.specialPricing || 'None'}
                        </td>
                        <td className="p-4 text-sm text-gray-900 dark:text-white">{user.betsCount}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                window.location.href = `/admin/users/${user.id}`;
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowGrantModal(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Grant Access
                            </Button>
                          </div>
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
                  {pagination.total} users
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

      {showGrantModal && selectedUser && (
        <GrantAccessModal
          user={selectedUser}
          onClose={() => {
            setShowGrantModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setShowGrantModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showGrantByEmailModal && (
        <GrantAccessByEmailModal
          onClose={() => setShowGrantByEmailModal(false)}
          onSuccess={() => {
            fetchUsers();
            setShowGrantByEmailModal(false);
          }}
        />
      )}
    </div>
  );
}

