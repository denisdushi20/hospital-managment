import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen p-8 bg-white text-black dark:bg-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Rreth Projektit</h1>
        <p className="text-lg leading-relaxed">
          Ky është një sistem menaxhimi për spitalin, i ndërtuar si pjesë e kursit "Zhvillim i Ueb-it në Anën e Klientit".
          Projekti përfshin autentifikim, menaxhim të të dhënave, faqe dinamike, dhe shumë funksionalitete të avancuara duke përdorur Next.js dhe Tailwind CSS.
        </p>
      </main>
      <Footer />
    </>
  );
}
