// lib/graphql/schema.ts
// GraphQL Schema - Define your types, queries, and mutations here

export const typeDefs = /* GraphQL */ `
  scalar JSON

  type Query {
    """
    Example health check query
    """
    health: HealthStatus!

    """
    Get clinic by ID
    """
    clinic(id: ID!): Clinic

    """
    Get practitioner by ID
    """
    practitioner(id: ID!): Practitioner

    """
    Get all clinics with their team members
    """
    allClinics: [Clinic!]!

    """
    Search clinics with filters
    """
    searchClinics(
      specialties: [String]
      languages: [String]
      city: String
      state: String
    ): [Clinic!]!
  }

  type Mutation {
    """
    Example mutation placeholder
    """
    placeholder(input: PlaceholderInput!): PlaceholderResult!
  }

  # ─── Types ───────────────────────────────────────

  type HealthStatus {
    status: String!
    timestamp: String!
  }

  type Clinic {
    id: ID!
    name: String!
    address: String
    city: String
    state: String
    postcode: String
    phone: String
    email: String
    rating: Float
    services: [Service!]!
    teamMembers: [TeamMember!]!
  }

  type Practitioner {
    id: ID!
    firstName: String!
    lastName: String!
    email: String
    qualification: String
    gender: String
    professionalStatement: String
    isVerified: Boolean
    services: [Service!]!
  }

  type Service {
    id: ID!
    name: String!
  }

  type TeamMember {
    id: ID!
    firstName: String!
    lastName: String!
    qualification: String
    gender: String
    updatedAt: String
  }

  type PlaceholderResult {
    success: Boolean!
    message: String
  }

  # ─── Inputs ──────────────────────────────────────

  input PlaceholderInput {
    value: String!
  }
`;
