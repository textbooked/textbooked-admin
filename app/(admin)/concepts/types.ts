export type ConceptRelationKind = "REQUIRES" | "PART_OF" | "RELATED_TO";
export const CONCEPT_RELATION_KINDS: ConceptRelationKind[] = ["REQUIRES", "PART_OF", "RELATED_TO"];

const CONCEPT_RELATION_LABELS: Record<ConceptRelationKind, string> = {
  REQUIRES: "Requires",
  PART_OF: "Part of",
  RELATED_TO: "Related to",
};

export function getConceptRelationLabel(kind: ConceptRelationKind): string {
  return CONCEPT_RELATION_LABELS[kind] ?? kind;
}

export type ConceptSummary = {
  id: string;
  name: string;
  slug: string;
};

export type ConceptEdgeDirection = "outgoing" | "incoming";

export type ConceptEdgeRow = {
  id: string;
  kind: ConceptRelationKind;
  from: ConceptSummary;
  to: ConceptSummary;
};

export type ConceptRow = {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  description?: string | null;
  updatedAt: string;
};

export type ConceptFormValues = {
  name: string;
  slug: string;
  aliases: string;
  description: string;
};
