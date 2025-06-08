import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-6 shadow-md text-gray-900">
  <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
  <ul className="space-y-2">
    <li><Link href="/admin/dashboard">Dashboard</Link></li>
    <li><Link href="/admin/users">Manage Users</Link></li>
    <li><Link href="/admin/reports">Reports</Link></li>
  </ul>
</aside>

  );
}
