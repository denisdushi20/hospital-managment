import AdminSidebar from '../Sidebar/AdminSidebar';
import Footer from '../Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white text-black">
      <AdminSidebar />
      <main className="flex-1 p-6 min-h-screen">
        {children}
        <Footer />
      </main>
    </div>
  );
}
