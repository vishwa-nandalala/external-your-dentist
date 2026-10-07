import Link from "next/link";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

const services = [
    {
        title: "General Dentistry",
        desc: "Routine checkups, cleanings, and preventive care for all ages.",
    },
    {
        title: "Cosmetic Dentistry",
        desc: "Teeth whitening, veneers, and smile makeovers tailored to you.",
    },
    {
        title: "Orthodontics",
        desc: "Braces and clear aligners for straighter, healthier teeth.",
    },
    {
        title: "Dental Implants",
        desc: "Permanent tooth replacement solutions that look and feel natural.",
    },
    {
        title: "Root Canal Therapy",
        desc: "Save damaged teeth with gentle, modern endodontic treatment.",
    },
    {
        title: "Emergency Care",
        desc: "Fast relief for dental pain, injuries, and urgent issues.",
    },
];

export default function ServicesPage() {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen bg-white">
                <section className="bg-[#163A5F] text-white py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Our <span className="text-[#19A7A0]">Services</span>
                        </h1>
                        <p className="text-[#DCEBED] max-w-2xl mx-auto">
                            Comprehensive dental care under one roof — from routine checkups to
                            advanced restorative treatments.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {services.map((s) => (
                            <div
                                key={s.title}
                                className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#19A7A0]/30 transition-all"
                            >
                                <h3 className="text-lg font-semibold text-[#163A5F] mb-2">
                                    {s.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/contact"
                            className="inline-block bg-[#19A7A0] hover:bg-[#148b85] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Book an Appointment
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}