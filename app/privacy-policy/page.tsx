import Footer from "../components/layouts/Footer";
import Navbar from "../components/layouts/Navbar";

export default function PrivacyPolicyPage() {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen bg-white">
                <section className="bg-[#163A5F] text-white py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            Privacy <span className="text-[#19A7A0]">Policy</span>
                        </h1>
                        <p className="text-[#DCEBED] mt-3 text-sm">
                            Last updated: {new Date().getFullYear()}
                        </p>
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8 text-gray-600 leading-relaxed">
                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            1. Information We Collect
                        </h2>
                        <p>
                            We collect information you provide directly, such as your name,
                            email address, phone number, and any details submitted through our
                            contact forms.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            2. How We Use Your Information
                        </h2>
                        <p>
                            Your information is used to respond to inquiries, schedule
                            appointments, and improve our services. We never sell your personal
                            data to third parties.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            3. Data Security
                        </h2>
                        <p>
                            We implement industry-standard safeguards to protect your personal
                            information from unauthorized access, disclosure, or misuse.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            4. Cookies
                        </h2>
                        <p>
                            Our site may use cookies to enhance your browsing experience. You
                            can disable cookies in your browser settings at any time.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            5. Contact Us
                        </h2>
                        <p>
                            For questions about this policy, email us at{" "}
                            <span className="text-[#19A7A0] font-medium">
                                info@yourdentist.com
                            </span>
                            .
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}