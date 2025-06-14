// app/about/page.tsx
"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* About Us Section (Original - Image Left, Text Right) */}
        <section className="bg-white py-20 px-6 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-10">
            Our Mission
          </h1>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center text-left">
            {/* Left Column: Image */}
            <div className="flex justify-center md:justify-end">
              <Image
                src="/aboutUs.jpeg"
                alt="Our Hospital Management Team"
                width={400}
                height={300}
                className="rounded-lg shadow-lg w-full max-w-md md:max-w-none h-auto object-cover"
              />
            </div>
            {/* Right Column: Text */}
            <div>
              <p className="mb-4 text-lg leading-relaxed text-gray-800">
                Welcome to our state-of-the-art Hospital Management System. Our
                mission is to revolutionize healthcare operations by providing
                an intuitive, secure, and comprehensive platform that connects
                patients, medical professionals, and administrative staff
                seamlessly.
              </p>
              <p className="mb-4 text-lg leading-relaxed text-gray-800">
                Founded on the principles of efficiency and patient-centric
                care, our system streamlines everything from appointment
                scheduling and patient record management to billing and
                analytics. We believe that by enhancing communication and
                automating routine tasks, we empower healthcare providers to
                focus more on what truly matters: delivering exceptional patient
                outcomes.
              </p>
              <p className="text-lg leading-relaxed text-gray-800">
                Our commitment extends to data security and privacy, adhering to
                the highest industry standards to ensure all sensitive
                information is protected. We are constantly innovating to meet
                the evolving needs of the healthcare industry, striving to make
                healthcare accessible, efficient, and reliable for everyone.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-20 px-6 text-center">
          {" "}
          <h2 className="text-4xl font-bold text-blue-900 mb-10">
            Our Team
          </h2>{" "}
          {/* Centered title */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center text-left">
            {/* Left Column: Text */}
            <div>
              <p className="mb-4 text-lg leading-relaxed text-gray-800">
                Behind our innovative Hospital Management System is a dedicated
                team of experts in healthcare, technology, and user experience.
                We are passionate about creating solutions that simplify complex
                processes and enhance the well-being of both patients and
                providers.
              </p>
              <p className="mb-4 text-lg leading-relaxed text-gray-800">
                Our diverse team comprises experienced software engineers,
                medical consultants, data analysts, and designers, all working
                collaboratively to build a platform that is not only powerful
                but also intuitive and reliable.
              </p>
              <p className="text-lg leading-relaxed text-gray-800">
                We pride ourselves on our agile development approach,
                continuously gathering feedback from medical professionals to
                ensure our system evolves with the real-world demands of modern
                hospitals.
              </p>
            </div>
            {/* Right Column: Image */}
            <div className="flex justify-center md:justify-start">
              {" "}
              <Image
                src="/OurTeam.jpg" 
                alt="Our Dedicated Team"
                width={400}
                height={300} 
                className="rounded-lg shadow-lg w-full max-w-md md:max-w-none h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Our Vision Section (Existing, remains below the new "Our Team" section) */}
        <section className="bg-gray-50 py-16 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">
              Our Vision
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              To be the leading digital health platform, fostering a connected
              and efficient healthcare ecosystem worldwide. We envision a future
              where technology simplifies complex medical processes, allowing
              for faster diagnostics, personalized treatment plans, and improved
              overall patient satisfaction.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
