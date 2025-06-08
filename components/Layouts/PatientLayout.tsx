import AdminSidebar from '../Sidebar/PatientSidebar';
import Footer from '../Footer';
import PatientSidebar from '../Sidebar/PatientSidebar';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white text-black">
      <PatientSidebar />
      <main className="flex-1 p-6 min-h-screen">
        {children}
        <Footer />
      </main>
    </div>
  );
}
