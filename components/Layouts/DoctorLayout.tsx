import AdminSidebar from '../Sidebar/DoctorSidebar';
import Footer from '../Footer';
import DoctorSidebar from '../Sidebar/DoctorSidebar';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white text-black">
      <DoctorSidebar />
      <main className="flex-1 p-6 min-h-screen">
        {children}
        <Footer />
      </main>
    </div>
  );
}
