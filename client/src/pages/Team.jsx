import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Mail, Users, Calendar } from 'lucide-react';
import { userService } from '@/api/services';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/helpers';

export default function Team() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, debouncedSearch],
    queryFn: () => userService.getUsers({ page, search: debouncedSearch }).then(res => res.data.data),
  });

  const users = data?.users || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const roleColors = {
    admin: 'primary',
    manager: 'info',
    member: 'default',
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Directory</h1>
          <p className="text-slate-500">Find and connect with people in your organization.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search members by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i}><CardBody className="p-6 text-center flex flex-col items-center gap-3"><Skeleton circle className="w-20 h-20" /><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-40" /></CardBody></Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="No users match your search criteria." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map(user => (
              <Card key={user._id} hover className="overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-sky-400" />
                <CardBody className="p-6 pt-0 text-center relative flex flex-col items-center">
                  <div className="relative -mt-12 mb-4 p-1 bg-white rounded-full inline-block shadow-sm">
                    <Avatar user={user} size="xl" className="border-4 border-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{user.name}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[40px]">
                    {user.bio || 'No bio provided'}
                  </p>
                  
                  <Badge variant={roleColors[user.role] || 'default'} className="uppercase mb-5">{user.role}</Badge>
                  
                  <div className="w-full space-y-2 mt-auto border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 justify-center">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate" title={user.email}>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 justify-center">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Joined {formatDate(user.createdAt, 'MMMM yyyy')}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
