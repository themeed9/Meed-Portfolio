import { z } from "zod";

export const caseStudySectionTypes = [
  "project_tldr", "problem_statement", "product_principle", "decision", "evidence",
  "before_after", "annotated_screen", "tradeoff", "user_flow", "interaction_states",
  "architecture_diagram", "design_system", "ai_collaboration", "timeline", "outcome",
  "reflection", "next_steps", "rich_text", "gallery",
] as const;

export type CaseStudySectionType = (typeof caseStudySectionTypes)[number];
export const caseStudySectionInputSchema = z.object({
  type: z.enum(caseStudySectionTypes).default("rich_text"),
  title: z.string().trim().max(160).optional().nullable(),
  eyebrow: z.string().trim().max(80).optional().nullable(),
  content: z.string().max(20_000).default(""),
  payload: z.json().optional(),
  metadata: z.json().optional(),
  imageUrl: z.string().url().optional().nullable(),
  imageAlt: z.string().trim().max(300).optional().nullable(),
  order: z.number().int().min(0).default(0),
});

const mediaSchema = z.object({ url: z.string().min(1), alt: z.string().min(1), caption: z.string().optional() });
const textBlockSchema = z.object({ body: z.string() });
const mediaBlockSchema = z.object({ media: z.array(mediaSchema).min(1), note: z.string().optional(), annotations: z.array(z.object({ number: z.string(), title: z.string(), detail: z.string() })).optional() });

const payloadSchemas = {
  project_tldr: z.object({ problem: z.string(), hypothesis: z.string(), role: z.string(), platform: z.string(), status: z.string(), contribution: z.string() }),
  problem_statement: textBlockSchema,
  product_principle: z.object({ principle: z.string(), rationale: z.string() }),
  decision: z.object({ context: z.string(), decision: z.string(), rationale: z.string(), tradeoff: z.string(), outcome: z.string().optional() }),
  before_after: z.object({ beforeMedia: mediaSchema, afterMedia: mediaSchema, change: z.string(), significance: z.string() }),
  evidence: z.object({ finding: z.string(), evidence: z.string(), implication: z.string().optional(), media: z.array(mediaSchema).optional() }),
  tradeoff: z.object({ options: z.array(z.object({ label: z.string(), benefit: z.string(), cost: z.string() })).min(2), decision: z.string() }),
  outcome: z.object({ result: z.string(), evidence: z.string().optional(), caveat: z.string().optional() }),
  annotated_screen: mediaBlockSchema,
  user_flow: mediaBlockSchema,
  interaction_states: mediaBlockSchema,
  architecture_diagram: mediaBlockSchema,
  design_system: mediaBlockSchema,
  ai_collaboration: z.object({ task: z.string(), use: z.string(), judgment: z.string(), outcome: z.string().optional() }),
  timeline: z.object({ events: z.array(z.object({ period: z.string(), title: z.string(), detail: z.string() })).min(1) }),
  reflection: textBlockSchema,
  next_steps: z.object({ items: z.array(z.string()).min(1) }),
  gallery: z.object({ media: z.array(mediaSchema).min(1) }),
  rich_text: z.object({ body: z.string() }),
} satisfies Partial<Record<CaseStudySectionType, z.ZodType>>;

export type CaseStudySectionRecord = {
  id: string;
  type?: string | null;
  title: string | null;
  eyebrow?: string | null;
  content: string;
  payload?: unknown;
  metadata?: unknown;
  imageUrl?: string | null;
  imageAlt?: string | null;
  order: number;
};

export function normalizeSection(section: CaseStudySectionRecord) {
  const type = caseStudySectionTypes.includes(section.type as CaseStudySectionType)
    ? (section.type as CaseStudySectionType)
    : "rich_text";
  const schema = payloadSchemas[type as keyof typeof payloadSchemas];
  const parsed = schema?.safeParse(section.payload);

  return {
    ...section,
    type,
    payload: parsed?.success ? parsed.data : type === "rich_text" ? { body: section.content } : null,
    payloadValid: Boolean(parsed?.success) || type === "rich_text",
  };
}
