// lib/graphql/resolvers.ts
// GraphQL Resolvers - Implement your query/mutation logic here

import type { GraphQLContext } from "./context";
import { practiceApi } from "@/lib/api/client";

interface PlaceholderInput {
  value: string;
}

export const resolvers = {
  Query: {
    health: (_parent: unknown, _args: unknown, _context: GraphQLContext) => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },

    clinic: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      // TODO: Replace with your actual data source
      // Example: return context.dataSources.clinicApi.getClinicById(id);
      return null;
    },

    practitioner: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      // TODO: Replace with your actual data source
      // Example: return context.dataSources.practitionerApi.getPractitionerById(id);
      return null;
    },

    allClinics: async (_parent: unknown, _args: unknown, _context: GraphQLContext) => {
      try {
        return await practiceApi.getAllClinics();
      } catch (error) {
        console.error("Error fetching all clinics for sitemap:", error);
        return [];
      }
    },

    searchClinics: async (
      _parent: unknown,
      args: {
        specialties?: string[];
        languages?: string[];
        city?: string;
        state?: string;
      },
      context: GraphQLContext,
    ) => {
      // TODO: Replace with your actual data source
      // Example: return context.dataSources.clinicApi.searchClinics(args);
      return [];
    },
  },

  Mutation: {
    placeholder: (
      _parent: unknown,
      { input }: { input: PlaceholderInput },
      _context: GraphQLContext,
    ) => {
      // TODO: Implement actual mutation logic
      return {
        success: true,
        message: `Received: ${input.value}`,
      };
    },
  },

  // ─── Field resolvers ──────────────────────────────
  // Use these to resolve nested fields that need custom logic

  Clinic: {
    services: async (clinic: any) => {
      // TODO: Resolve services from data source
      return clinic?.practice_services ?? [];
    },
    teamMembers: async (clinic: any) => {
      // TODO: Resolve team members from data source
      return clinic?.practice_team_members ?? [];
    },
  },

  Service: {
    id: (service: any) => service.id ?? service.all_service_id ?? "",
    name: (service: any) => service.name ?? service.service_name ?? "",
  },

  TeamMember: {
    firstName: (member: any) => member.first_name ?? "",
    lastName: (member: any) => member.last_name ?? "",
    updatedAt: (member: any) => member.updated_at ?? null,
  },

  Practitioner: {
    firstName: (p: any) => p.first_name ?? "",
    lastName: (p: any) => p.last_name ?? "",
    isVerified: (p: any) => p.is_visible_online ?? false,
  },
};
