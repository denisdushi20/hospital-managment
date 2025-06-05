export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 text-sm py-6 border-t mt-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p>© {new Date().getFullYear()} Hospital Management. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/support" className="hover:underline">Support</a>
        </div>
      </div>
    </footer>
  );
}
