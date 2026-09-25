// // app/layout.tsx

// import type { Metadata } from "next";
// import { Poppins } from "next/font/google";
// import { ReduxProvider } from "./providers/ReduxProvider";
// import { ApolloProvider } from "./providers/ApolloProvider";
// import "./globals.css";

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   variable: "--font-poppins",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"),
//   title: {
//     default: "Your Dentist - Find & Book Trusted Dentists",
//     template: "%s | Your Dentist",
//   },
//   description:
//     "Find trusted dentists and dental clinics near you. Compare dentists, explore dental services, and book your dental appointment easily.",
//   keywords: ["dentist", "dentist near me", "dental clinic", "dentist appointment"],
//   robots: {
//     index: true,
//     follow: true,
//   },
//   openGraph: {
//     type: "website",
//     siteName: "Your Dentist",
//     title: "Your Dentist - Find & Book Trusted Dentists",
//     description: "Find trusted dentists and dental clinics near you.",
//     locale: "en_IN",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Your Dentist - Find & Book Trusted Dentists",
//     description: "Find trusted dentists and dental clinics near you.",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className={poppins.variable}>
//       <body>
//         <ApolloProvider>
//           <ReduxProvider>
//             {children}
//           </ReduxProvider>
//         </ApolloProvider>
//       </body>
//     </html>
//   );
// }

// app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ReduxProvider } from "./providers/ReduxProvider";
import { ApolloProvider } from "./providers/ApolloProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://yourdentist.com"
  ),

  title: {
    default: "Your Dentist - Find & Book Trusted Dentists",
    template: "%s | Your Dentist",
  },

  description:
    "Find trusted dentists and dental clinics near you. Compare dentists, explore dental services, and book your dental appointment easily.",

  keywords: [
    // General Dentist Search
    "dentist",
    "find dentist",
    "search dentist",
    "dentist near me",
    "best dentist",
    "top dentist",
    "trusted dentist",
    "experienced dentist",
    "local dentist",
    "nearby dentist",

    // Dental Clinics
    "dental clinic",
    "dental clinic near me",
    "best dental clinic",
    "dental hospital",
    "dental care clinic",
    "nearby dental clinic",
    "trusted dental clinic",

    // Appointments
    "book dentist appointment",
    "book dental appointment",
    "dentist appointment",
    "online dentist booking",
    "online dental appointment",
    "schedule dentist appointment",
    "dentist appointment booking",
    "dental appointment online",

    // Dental Services
    "dental care",
    "dental treatment",
    "teeth cleaning",
    "dental checkup",
    "oral health",
    "preventive dental care",
    "professional dental care",

    // Popular Dental Treatments
    "teeth whitening",
    "root canal treatment",
    "dental implants",
    "dental braces",
    "orthodontic treatment",
    "tooth extraction",
    "wisdom tooth removal",
    "dental crown",
    "dental bridge",
    "dental filling",
    "dentures",

    // Dental Specialists
    "general dentist",
    "cosmetic dentist",
    "orthodontist",
    "endodontist",
    "periodontist",
    "pediatric dentist",
    "oral surgeon",
    "dental specialist",

    // Trust & Discovery
    "trusted dentists",
    "verified dentists",
    "find dental clinic",
    "compare dentists",
    "dentist reviews",
    "dentist ratings",
    "best dental care",

    // Australia-focused SEO
    "dentist in Australia",
    "dental clinic in Australia",
    "find dentist in Australia",
    "book dentist appointment online Australia",
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    siteName: "Your Dentist",
    title: "Your Dentist - Find & Book Trusted Dentists",
    description:
      "Find trusted dentists and dental clinics near you. Compare dentists and book appointments easily.",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "Your Dentist - Find & Book Trusted Dentists",
    description:
      "Find trusted dentists and dental clinics near you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <ApolloProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}