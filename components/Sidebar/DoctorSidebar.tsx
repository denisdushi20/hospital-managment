import Link from 'next/link';

export default function DoctorSidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-4 shadow-md  text-gray-900">
      <h2 className="text-lg font-semibold mb-4">Doctor Panel</h2>
      <ul className="space-y-2">
        <li><Link href="/doctor/dashboard">Dashboard</Link></li>
        <li><Link href="/doctor/patients">My Patients</Link></li>
        <li><Link href="/doctor/notes">Send Notes</Link></li>
      </ul>
    </aside>
  );
}
