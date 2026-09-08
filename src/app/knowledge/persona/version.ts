/**
 * Ask Vikram — Versioned Runtime Persona Configuration
 */

export interface PersonaConfig {
  version: string;
  name: string;
  representativeOf: string;
  releaseDate: string;
  allowApplicationMode: boolean;
  disclosureNotice: string;
}

export const PERSONA_CONFIG: PersonaConfig = {
  version: "2026.1.0",
  name: "Ask Vikram",
  representativeOf: "Vikram Venkatesh",
  releaseDate: "2026-09-08",
  allowApplicationMode: true, // Controlled application of documented principles
  disclosureNotice: "Vikram's AI · Grounded in verified portfolio records"
};
