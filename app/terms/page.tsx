import Footer from "../components/layouts/Footer";
import Navbar from "../components/layouts/Navbar";

export default function TermsPage() {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen bg-white">
                <section className="bg-[#163A5F] text-white py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            Terms of <span className="text-[#19A7A0]">Service</span>
                        </h1>
                        <p className="text-[#DCEBED] mt-3 text-sm">
                            Last updated: {new Date().getFullYear()}
                        </p>
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8 text-gray-600 leading-relaxed">
                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using YourDentist, you agree to be bound by these
                            Terms of Service. If you do not agree, please do not use our
                            platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            2. Use of Services
                        </h2>
                        <p>
                            Our platform connects patients with dental professionals. We do not
                            provide medical advice or dental treatment directly. Always consult
                            a licensed professional for medical concerns.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            3. User Responsibilities
                        </h2>
                        <p>
                            You agree to provide accurate information and to use our services
                            lawfully. Misuse of the platform may result in termination of
                            access.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            4. Limitation of Liability
                        </h2>
                        <p>
                            YourDentist is not liable for any indirect, incidental, or
                            consequential damages arising from your use of the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            5. Changes to Terms
                        </h2>
                        <p>
                            We may update these terms from time to time. Continued use of the
                            platform after changes constitutes acceptance of the updated terms.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#163A5F] mb-2">
                            6. Contact
                        </h2>
                        <p>
                            Questions? Reach us at{" "}
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