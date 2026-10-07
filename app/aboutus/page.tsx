import Footer from "../components/layouts/Footer";
import Navbar from "../components/layouts/Navbar";

export default function AboutUsPage() {
  return (
    <div>
        <Navbar />
    <main className="min-h-screen bg-white">
      <section className="bg-[#163A5F] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-[#19A7A0]">Us</span>
          </h1>
          <p className="text-[#DCEBED] max-w-2xl mx-auto">
            Dedicated to connecting patients with trusted dental professionals
            for better oral health.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#163A5F] mb-3">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              At YourDentist, we believe everyone deserves access to quality
              dental care. Our platform makes it simple to find trusted
              professionals, book appointments, and stay on top of your oral
              health — all in one place.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#163A5F] mb-3">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To be the most trusted bridge between patients and dental
              professionals, empowering healthier smiles across every
              community.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#163A5F] mb-6">
              Our Values
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { t: "Trust", d: "Verified professionals you can rely on." },
                { t: "Care", d: "Patient-first approach in everything we do." },
                { t: "Quality", d: "High standards for every experience." },
              ].map((v) => (
                <div
                  key={v.t}
                  className="p-6 rounded-xl border border-gray-100 shadow-sm"
                >
                  <h3 className="font-semibold text-[#19A7A0] mb-2">{v.t}</h3>
                  <p className="text-gray-600 text-sm">{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </div>
  );
}