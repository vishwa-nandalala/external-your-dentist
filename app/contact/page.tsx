import Footer from "../components/layouts/Footer";
import Navbar from "../components/layouts/Navbar";

const contactItems = [
    {
        label: "Address",
        lines: ["123 Dental Street,", "City, State 12345"],
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#19A7A0]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
        ),
    },
    {
        label: "Phone",
        lines: [
            { text: "(123) 456-7890", href: "tel:+11234567890" },
        ],
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#19A7A0]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.29a1 1 0 01-.27 1.06l-1.2 1.2a14 14 0 006.36 6.36l1.2-1.2a1 1 0 011.06-.27l3.29 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C10.85 21 3 13.15 3 5z"
                />
            </svg>
        ),
    },
    {
        label: "Email",
        lines: [
            { text: "info@yourdentist.com", href: "mailto:info@yourdentist.com" },
        ],
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#19A7A0]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
            </svg>
        ),
    },
    {
        label: "Hours",
        lines: ["Mon – Sat: 9:00 AM – 6:00 PM", "Sunday: Closed"],
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#19A7A0]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    },
];

export default function ContactPage() {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero */}
                <section className="bg-[#163A5F] text-white py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Contact <span className="text-[#19A7A0]">Us</span>
                        </h1>
                        <p className="text-[#DCEBED] max-w-2xl mx-auto">
                            Have a question or want to book an appointment? We'd love to hear
                            from you.
                        </p>
                    </div>
                </section>

                {/* Contact Info */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-[#163A5F] mb-6 text-center">
                            Get in Touch
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {contactItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="w-10 h-10 bg-[#19A7A0]/10 rounded-lg flex items-center justify-center mb-3">
                                        {item.icon}
                                    </div>
                                    <p className="font-semibold text-[#163A5F] mb-1">
                                        {item.label}
                                    </p>
                                    <div className="text-gray-600 text-sm space-y-0.5">
                                        {item.lines.map((line, i) =>
                                            typeof line === "string" ? (
                                                <p key={i}>{line}</p>
                                            ) : (
                                                <a
                                                    key={i}
                                                    href={line.href}
                                                    className="block hover:text-[#19A7A0] transition-colors"
                                                >
                                                    {line.text}
                                                </a>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}