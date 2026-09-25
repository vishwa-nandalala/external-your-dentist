"use client";

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white">
      <div className="site-container py-12 lg:py-16">
        <div
          className="
            grid
            grid-cols-1
            gap-10
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.1fr_1.2fr]
            lg:gap-10
            xl:gap-12
          "
        >
          {/* ================= LOGO ================= */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block w-fit">
              <img
                src="/logo.svg"
                alt="Local Dentist Near Me"
                className="h-10 w-auto sm:h-11"
              />
            </Link>

            <p className="mt-3 text-base leading-6 text-[#71808C]">
              Dental care for every Australian community.
            </p>

            <p className="mt-8 text-sm leading-5 text-[#7B8790] lg:mt-auto">
              © {currentYear} Local Dentist Near Me. All rights reserved.
            </p>
          </div>

          {/* ================= FOR PATIENTS ================= */}
          <div>
            <h3 className="mb-4 text-base font-semibold leading-6 text-[#17344B]">
              For Patients
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/find-dentists" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Find a Dentist
              </Link>
              <Link href="/services" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Dental Services
              </Link>
              <Link href="/how-it-works" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                How It Works
              </Link>
              <Link href="/blog" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Blog / Dental Advice
              </Link>
            </div>
          </div>

          {/* ================= FOR PRACTICES ================= */}
          <div>
            <h3 className="mb-4 text-base font-semibold leading-6 text-[#17344B]">
              For Practices
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/practice/signup" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                List Your Practice
              </Link>
              <Link href="/practice-resources" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Practice Resources
              </Link>
              <Link href="/pricing" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Pricing
              </Link>
              <Link href="/help" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Help Centre
              </Link>
            </div>
          </div>

          {/* ================= ABOUT ================= */}
          <div>
            <h3 className="mb-4 text-base font-semibold leading-6 text-[#17344B]">
              About
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/aboutus" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Our Mission
              </Link>
              <Link href="/contact" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Contact Us
              </Link>
              <Link href="/privacy-policy" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Terms of Use
              </Link>
            </div>
          </div>

          {/* ================= POPULAR LOCATIONS ================= */}
          <div>
            <h3 className="mb-4 text-base font-semibold leading-6 text-[#17344B]">
              Popular Locations
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/locations/sydney" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Sydney
              </Link>
              <Link href="/locations/melbourne" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Melbourne
              </Link>
              <Link href="/locations/brisbane" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Brisbane
              </Link>
              <Link href="/locations/perth" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Perth
              </Link>
              <Link href="/locations/adelaide" className="text-base leading-6 text-[#637583] transition-colors hover:text-[#19A7A0]">
                Adelaide
              </Link>
              <Link href="/locations" className="mt-1 flex items-center gap-1 text-base font-semibold leading-6 text-[#19A7A0] hover:text-[#138E89]">
                View all locations
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>

          {/* ================= AUSTRALIA / SOCIAL ================= */}
          <div className="flex flex-col">
          <p className="flex items-center justify-end gap-3 text-base leading-[22px] text-[#7B8790]">
  <svg
    className="hidden sm:block shrink-0"
    width="96"
    height="74"
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 29.5L18 24L25 23L29 18L38 20L44 14L53 16L60 12L68 17L77 16L84 22L81 29L87 35L84 43L78 46L77 54L70 58L63 55L57 62L50 59L44 63L37 58L30 59L27 52L20 51L21 44L15 40L18 34L13.5 29.5Z"
      fill="#DCECF0"
    />
    <path
      d="M84 58L89 55L94 58L91 64L86 63L84 58Z"
      fill="#DCECF0"
    />
  </svg>

  <span>Supporting healthier smiles across Australia</span>
</p>

            <div className="mt-auto flex items-center justify-end gap-5 pt-6">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="text-[#123B58] transition-colors hover:text-[#19A7A0]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.5 8H17V4.2C16.57 4.14 15.09 4 13.42 4 9.94 4 7.56 6.13 7.56 10.03V13H4V17H7.56V24H11.93V17H15.13L15.64 13H11.93V10.49C11.93 9.33 12.25 8 14.5 8Z" />
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="text-[#123B58] transition-colors hover:text-[#19A7A0]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="text-[#123B58] transition-colors hover:text-[#19A7A0]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.2 8.1H2V21h3.2V8.1ZM3.6 3C2.6 3 2 3.7 2 4.6s.6 1.6 1.6 1.6 1.6-.7 1.6-1.6S4.6 3 3.6 3ZM21 13.5C21 9.6 19 8 16.1 8c-2.2 0-3.2 1.2-3.8 2V8.3H9.1V21h3.2v-6.4c0-1.7.3-3.3 2.4-3.3 2 0 2 1.8 2 3.4V21H20v-7.5H21Z" />
                </svg>
              </a>

              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="text-[#123B58] transition-colors hover:text-[#19A7A0]">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.58 7.19C21.36 6.36 20.71 5.7 19.88 5.48 18.37 5.08 12 5.08 12 5.08s-6.37 0-7.88.4C3.29 5.7 2.64 6.36 2.42 7.19 2 8.7 2 12 2 12s0 3.3.42 4.81c.22.83.87 1.49 1.7 1.71 1.51.4 7.88.4 7.88.4s6.37 0 7.88-.4c.83-.22 1.48-.88 1.7-1.71C22 15.3 22 12 22 12s0-3.3-.42-4.81ZM10 15.5v-7l6 3.5-6 3.5Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ================= MOBILE COPYRIGHT ================= */}
        <div className="mt-10 border-t border-[#EEF2F3] pt-6 lg:hidden">
          <p className="text-center text-sm leading-5 text-[#7B8790]">
            © {currentYear} Local Dentist Near Me. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;