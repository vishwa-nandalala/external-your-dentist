import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Dentists Near You",
  description:
    "Find trusted dentists and dental clinics near you. Explore dentist profiles, services, locations, and appointment availability.",
};

export default function FindDentistsPage() {
  return (
    <main>
      <section>
        <h1>Find Dentists Near You</h1>

        <p>
          Search and discover trusted dentists and dental clinics
          based on your location and dental requirements.
        </p>
      </section>

      <section>
        <h2>Search for a Dentist</h2>

        <form>
          <input
            type="text"
            name="location"
            placeholder="Enter city or location"
          />

          <input
            type="text"
            name="service"
            placeholder="Dental service"
          />

          <button type="submit">
            Search
          </button>
        </form>
      </section>
    </main>
  );
}