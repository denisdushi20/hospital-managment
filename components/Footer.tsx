// components/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white py-8 px-6 text-gray-600 text-sm shadow-md">
      {" "}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p>
          © {new Date().getFullYear()} Hospital Management. All rights reserved.
        </p>
        <div className="flex gap-4 mt-4 md:mt-0">
          {" "}
          <a
            href="/privacy"
            className="hover:underline text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="hover:underline text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            Terms
          </a>
          <a
            href="/support"
            className="hover:underline text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
