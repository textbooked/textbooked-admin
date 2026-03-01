export const KNOWLEDGE_AREA_KINDS = ["DOMAIN", "TOPIC", "TOOL", "LANGUAGE"] as const;

export type KnowledgeAreaKind = (typeof KNOWLEDGE_AREA_KINDS)[number];

export type KnowledgeAreaRow = {
  id: string;
  name: string;
  slug: string;
  kind: KnowledgeAreaKind;
  aliases: string[];
  description?: string | null;
  updatedAt: string;
};

export type KnowledgeAreaFormValues = {
  name: string;
  slug: string;
  kind: KnowledgeAreaKind;
  aliases: string;
  description: string;
};
