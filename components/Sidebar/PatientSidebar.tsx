import Link from 'next/link';

export default function PatientSidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-4 shadow-md  text-gray-900">
      <h2 className="text-lg font-semibold mb-4">Patient Panel</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/patient/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/patient/appointments">My Appointments</Link>
        </li>
      </ul>
    </aside>
  );
}
