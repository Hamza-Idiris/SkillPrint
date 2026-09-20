import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </AdminGuard>
  );
}
