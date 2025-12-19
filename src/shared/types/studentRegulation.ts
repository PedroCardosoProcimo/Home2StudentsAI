import { Regulation } from './regulation';
import { RegulationAcceptance } from './index';

/**
 * Combined regulation and acceptance status for a student
 * Used in the student-facing regulation viewing page
 */
export interface MyRegulationStatus {
  // Current regulation for student's residence
  regulation: Regulation;

  // Acceptance status
  hasAccepted: boolean;
  acceptance?: RegulationAcceptance; // Populated if accepted

  // Derived/computed fields
  residenceName: string; // For display purposes
}
