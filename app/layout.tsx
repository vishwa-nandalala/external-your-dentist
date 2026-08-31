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
    "dentist",
    "dentist near me",
    "find dentist",
    "dental clinic",
    "dental clinic near me",
    "book dentist appointment",
    "dental appointment",
    "dental care",
    "trusted dentists",
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