import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dental Services",
  description:
    "Explore dental services and treatments including dental implants, root canals, teeth cleaning, braces, and more.",
};

const services = [
  {
    name: "Teeth Cleaning",
    slug: "teeth-cleaning",
  },
  {
    name: "Root Canal",
    slug: "root-canal",
  },
  {
    name: "Dental Implants",
    slug: "dental-implants",
  },
  {
    name: "Braces",
    slug: "braces",
  },
  {
    name: "Teeth Whitening",
    slug: "teeth-whitening",
  },
];

export default function ServicesPage() {
  return (
    <main>
      <section>
        <h1>Dental Services</h1>

        <p>
          Explore dental treatments and services available from
          dentists and dental clinics.
        </p>
      </section>

      <section>
        {services.map((service) => (
          <article key={service.slug}>
            <h2>
              <Link href={`/services/${service.slug}`}>
                {service.name}
              </Link>
            </h2>
          </article>
        ))}
      </section>
    </main>
  );
}