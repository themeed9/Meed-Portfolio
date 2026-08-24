import assert from "node:assert/strict";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.ts";

const apply = process.argv.includes("--apply");
const slugs = {
  gofinancial: "gofinancial",
  backrock: "backrock-insurance-digital-transformation-design-system-",
  securegate: "securegate-authentication-security-platform",
} as const;

const content: Record<string, Prisma.InputJsonObject> = {
  "homepage-about": {
    title: "I turn complex product problems into clear, implementable experiences.",
    paragraphs: [
      "I am a Product Designer working across fintech, SaaS, responsive web, and product systems. I connect user needs, product priorities, interaction design, and implementation constraints so the experience remains coherent beyond the final screen.",
      "My technical fluency helps me collaborate closely with engineering and build realistic prototypes. I use AI to accelerate exploration, synthesis, and implementation where it is useful, while keeping product judgment, evidence, and quality decisions human-led.",
    ],
    principles: [
      { title: "Make reasoning visible", text: "Show the problem, evidence, decision, and trade-off—not only the polished interface." },
      { title: "Design through implementation", text: "Responsive behaviour, accessibility, edge cases, and engineering constraints are part of the product decision." },
    ],
  },
  "homepage-workflow": {
    title: "From problem framing to implementation.",
    description: "I move from ambiguity to a working product through research, product judgment, interaction design, and technical collaboration. AI can accelerate exploration and documentation, but decisions remain grounded in evidence and constraints.",
    steps: [
      { number: "01", title: "Frame", description: "Clarify the user problem, product decision, constraints, and evidence before exploring screens." },
      { number: "02", title: "Explore", description: "Compare credible flows and interface directions against product principles and implementation realities." },
      { number: "03", title: "Prototype", description: "Make behaviour tangible, expose edge cases, and test whether the hierarchy supports the intended task." },
      { number: "04", title: "Implement and refine", description: "Work with engineering—or build directly—to verify states, responsiveness, accessibility, and interaction quality." },
    ],
  },
  "work-page": {
    eyebrow: "Selected work",
    title: "Product decisions, made visible.",
    description: "Case studies across financial tools, service experiences, and account security—showing the problem, the decisions, and the evidence behind the interface.",
    supportingTitle: "Additional product explorations.",
  },
  "homepage-cta": {
    eyebrow: "Start a conversation",
    title: "Looking for a Product Designer who can bring structure, interaction quality, and technical fluency to complex work?",
    primaryLabel: "Contact",
    secondaryLabel: "Resume",
  },
  "contact-page": {
    eyebrow: "Contact",
    title: "Let’s make the complex feel clear.",
    intro: "For Product Designer opportunities, product systems work, or thoughtful collaboration, reach me directly by email or LinkedIn.",
    location: "Lagos, Nigeria · Available remotely",
  },
  "resume-content": {
    name: "Abdulhameed Abdulsalam",
    title: "Product Designer",
    location: "Lagos, Nigeria · Available remotely",
    summary: "Product Designer focused on clear, scalable digital products across fintech, SaaS, mobile, and responsive web. I work from problem framing and interaction design through reusable systems and implementation collaboration.",
    tools: [
      { name: "Figma", category: "Product design and prototyping" },
      { name: "React / Next.js", category: "Implementation fluency" },
      { name: "Git", category: "Engineering collaboration" },
      { name: "AI-assisted workflows", category: "Exploration, synthesis, and implementation support" },
    ],
    education: [
      { degree: "B.A. English", school: "University of Ilorin" },
      { degree: "UI/UX Design Certificate", school: "Dev and Design · 2023" },
    ],
  },
};

const resumeExperiences = [
  {
    year: "2023 – Present",
    title: "UI/UX Designer",
    company: "TrustBanc Microfinance Bank",
    description: "Design customer-facing and internal fintech experiences, translating product requirements into user flows, responsive interfaces, prototypes, reusable patterns, and implementation-ready specifications in collaboration with product, engineering, and business stakeholders.",
    order: 0,
  },
  {
    year: "2023 – Present",
    title: "Product Designer",
    company: "DealRide Autos",
    description: "Design responsive product experiences for vehicle discovery, comparison, and purchase decision-making, working across UX structure, content hierarchy, interface design, and engineering collaboration.",
    order: 1,
  },
  {
    year: "2019 – Present",
    title: "Freelance Product / UX Designer",
    company: "Self-employed",
    description: "Design digital products across fintech, services, and e-commerce, including product flows, wireframes, prototypes, responsive interfaces, and reusable design systems.",
    order: 2,
  },
];

const beforeCounts = await Promise.all([
  prisma.project.count(),
  prisma.caseStudySection.count(),
  prisma.projectImage.count(),
  prisma.siteContent.count(),
  prisma.resumeExperience.count(),
  prisma.socialLink.count(),
  prisma.skill.count(),
]);

const projects = await prisma.project.findMany({
  where: { slug: { in: Object.values(slugs) } },
  include: { images: true, caseStudySections: { orderBy: { order: "asc" } } },
});
assert.equal(projects.length, 3, "Expected exactly the three recruiter-release projects.");
const bySlug = new Map(projects.map((project) => [project.slug, project]));
const gofinancial = bySlug.get(slugs.gofinancial);
const backrock = bySlug.get(slugs.backrock);
const securegate = bySlug.get(slugs.securegate);
assert(gofinancial && backrock && securegate, "A required project is missing.");
assert.equal(gofinancial.title, "GoFinancial");
assert.equal(backrock.caseStudySections.length, 0, "BackRock no longer matches the approved empty-section baseline.");
assert.equal(securegate.caseStudySections.length, 4, "SecureGate no longer matches the approved four-section baseline.");
assert.equal(securegate.images.length, 3, "SecureGate no longer has exactly the three unrelated evidence rows.");
assert(securegate.caseStudySections.some((section) => section.content.includes("500+ users")), "SecureGate unsupported-claim fingerprint was not found.");
assert(securegate.images.every((image) => image.url.includes("payflow-fintech-dashboard")), "SecureGate image rows are not the expected PayFlow placeholders.");

const gofinancialPrimaryEvidence = gofinancial.caseStudySections.find((section) => section.title === "The product needed to connect capture and awareness in one short loop.");
const gofinancialAwarenessEvidence = gofinancial.caseStudySections.find((section) => section.title === "Daily, weekly, and monthly views answered different questions.");
assert(gofinancialPrimaryEvidence?.payload && typeof gofinancialPrimaryEvidence.payload === "object");
assert(gofinancialAwarenessEvidence?.payload && typeof gofinancialAwarenessEvidence.payload === "object");

const skills = await prisma.skill.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });
const skillGroups = new Map<string, typeof skills>();
for (const skill of skills) {
  const key = `${skill.name.trim().toLowerCase()}::${skill.category.trim().toLowerCase()}`;
  skillGroups.set(key, [...(skillGroups.get(key) ?? []), skill]);
}
const duplicateSkills = [...skillGroups.values()].flatMap((group) => group.slice(1));

const plan = {
  mode: apply ? "apply" : "dry-run",
  targetProjects: projects.map((project) => ({ title: project.title.trim(), slug: project.slug })),
  beforeCounts: {
    project: beforeCounts[0], caseStudySection: beforeCounts[1], projectImage: beforeCounts[2],
    siteContent: beforeCounts[3], resumeExperience: beforeCounts[4], socialLink: beforeCounts[5], skill: beforeCounts[6],
  },
  securegate: { sectionsToReplace: securegate.caseStudySections.length, payflowImagesToRemove: securegate.images.length },
  backrock: { sectionsToCreate: 4 },
  gofinancial: { evidenceBlocksToEnrich: 2, evidenceAssets: 3 },
  resumeExperiencesToCreate: resumeExperiences.length,
  verifiedLinkedIn: "https://www.linkedin.com/in/abdulhameed-abdulsalam-305568149/",
  exactDuplicateSkillsToRemove: duplicateSkills.map((skill) => ({ name: skill.name, category: skill.category })),
};

if (!apply) {
  console.log(JSON.stringify(plan, null, 2));
  await prisma.$disconnect();
  process.exit(0);
}

await prisma.$transaction(async (tx) => {
  for (const [key, value] of Object.entries(content)) {
    await tx.siteContent.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  await tx.project.update({
    where: { id: gofinancial.id },
    data: { recruiterSummary: "An awareness-first personal finance product that connects rapid expense logging with clear daily, weekly, and monthly spending context. I shaped the product principle, interaction model, interface hierarchy, and implementation direction." },
  });
  await tx.caseStudySection.update({
    where: { id: gofinancialPrimaryEvidence.id },
    data: { payload: {
      ...(gofinancialPrimaryEvidence.payload as Prisma.JsonObject),
      media: [
        { url: "/uploads/gofinancial-expense-entry.png", alt: "GoFinancial New Expense flow with amount, category, and description completed", caption: "Expense entry keeps amount and category selection inside one focused action." },
        { url: "/uploads/gofinancial-daily-dashboard.png", alt: "GoFinancial dashboard updated after saving a transport expense", caption: "Saving the entry immediately updates the daily total and transaction history." },
      ],
    } },
  });
  await tx.caseStudySection.update({
    where: { id: gofinancialAwarenessEvidence.id },
    data: { payload: {
      ...(gofinancialAwarenessEvidence.payload as Prisma.JsonObject),
      media: [
        { url: "/uploads/gofinancial-weekly-insight.png", alt: "GoFinancial weekly spending chart and category breakdown", caption: "The same entry contributes to weekly awareness and category context." },
      ],
    } },
  });

  await tx.project.update({
    where: { id: backrock.id },
    data: {
      title: backrock.title.trim(),
      description: "A responsive insurance experience exploring how clearer hierarchy, explanation, and reusable interface patterns can support trust in a complex service decision.",
      recruiterSummary: "A responsive insurance concept focused on making complex service information easier to scan, understand, and act on. I shaped the information hierarchy, interaction patterns, and reusable visual system.",
      overview: "BackRock Insurance is framed as a trust and comprehension problem: helping prospective customers understand a consequential financial service, compare what matters, and move forward without avoidable ambiguity.",
      challenge: "Insurance decisions combine unfamiliar terminology, risk, and high information density. The experience needed to establish credibility while making products, benefits, next steps, and supporting information easier to scan across screen sizes.",
      approach: "The design uses clearer information hierarchy, progressive disclosure, consistent explanation patterns, and responsive components. Visual polish supports comprehension and trust rather than acting as a substitute for them.",
      results: "The documented outcome is a structured responsive experience and reusable interface direction. Conversion or comprehension improvements are not claimed because supporting measurement is not present.",
    },
  });
  const backrockEvidenceUrl = backrock.heroImage || backrock.homepageImage || backrock.coverImage;
  await tx.caseStudySection.createMany({ data: [
    { projectId: backrock.id, type: "problem_statement", eyebrow: "Problem framing", title: "Trust needed to be built through comprehension, not decoration.", content: "The experience needed to explain an unfamiliar service, establish credibility, and make the next action understandable across desktop and mobile.", payload: { body: "The experience needed to explain an unfamiliar service, establish credibility, and make the next action understandable across desktop and mobile." }, order: 1 },
    { projectId: backrock.id, type: "decision", eyebrow: "Key decision", title: "Organise the experience around customer decisions.", content: "", payload: { context: "Dense insurance information can make every section feel equally important.", decision: "Structure content around orientation, service explanation, reassurance, and next steps.", rationale: "A repeated decision path makes complex information easier to scan without oversimplifying it.", tradeoff: "The approach depends on disciplined content and still requires comprehension testing with prospective customers." }, order: 2 },
    { projectId: backrock.id, type: "evidence", eyebrow: "Solution", title: "A reusable responsive direction keeps the hierarchy consistent.", content: "", payload: { finding: "Trust cues weaken when layouts and calls to action change unpredictably between sections.", evidence: "The existing interface direction uses repeated content patterns, responsive hierarchy, and a restrained visual system.", implication: "Consistency should reduce the effort of understanding each new section; formal outcome testing remains future work.", ...(backrockEvidenceUrl ? { media: [{ url: backrockEvidenceUrl, alt: "BackRock responsive insurance interface", caption: "Existing responsive interface direction; no conversion outcome is claimed." }] } : {}) }, order: 3 },
    { projectId: backrock.id, type: "reflection", eyebrow: "Learning", title: "The next useful step is validation, not more visual breadth.", content: "A future iteration should test comprehension with prospective customers and insurance specialists, then use observed hesitation and questions to refine language, hierarchy, and interaction.", payload: { body: "A future iteration should test comprehension with prospective customers and insurance specialists, then use observed hesitation and questions to refine language, hierarchy, and interaction." }, order: 4 },
  ] });

  await tx.project.update({
    where: { id: securegate.id },
    data: {
      description: "A working authentication product exploring how signup, verification, login, protected states, password recovery, and rate limiting can remain understandable as one connected system.",
      recruiterSummary: "A concise authentication case study showing how product design and implementation decisions work together across signup, verification, login, recovery, and protected states. No security certification or measured outcome is claimed.",
      role: "Product Designer & Developer",
      category: "Product design · Authentication · Responsive web",
      tags: ["Authentication", "Interaction design", "Systems thinking", "Technical fluency"],
      overview: "SecureGate is a working personal project focused on one connected authentication system: account creation, login, email verification, password recovery, session handling, protected routes, and rate limiting.",
      challenge: "Authentication is not one screen. It is a network of happy paths, errors, time-sensitive states, security constraints, and recovery routes. The design challenge was to make each state understandable while preserving the underlying access rules.",
      approach: "The work maps account creation, login, verification, password reset, protected routes, validation, loading, expiration, and recovery as connected states. Interface decisions account for server validation, API latency, session state, and route protection.",
      results: "The outcome is a working authentication product and a clearer state model. It is not presented as independently audited, certified, or validated through completion-rate or security-performance metrics.",
    },
  });
  await tx.projectImage.deleteMany({ where: { projectId: securegate.id } });
  await tx.caseStudySection.deleteMany({ where: { projectId: securegate.id } });
  await tx.caseStudySection.createMany({ data: [
    { projectId: securegate.id, type: "problem_statement", eyebrow: "System problem", title: "Authentication needed to remain legible across success, failure, and recovery.", content: "A secure flow can still fail users when requirements, current status, and recovery paths are unclear. SecureGate treats identity, verification, session state, protected content, failure, and recovery as one product system.", payload: { body: "A secure flow can still fail users when requirements, current status, and recovery paths are unclear. SecureGate treats identity, verification, session state, protected content, failure, and recovery as one product system." }, order: 1 },
    { projectId: securegate.id, type: "decision", eyebrow: "Key decision", title: "Make recovery and edge states first-class parts of the flow.", content: "", payload: { context: "Signup and login are only part of the authentication experience.", decision: "Design verification, invalid credentials, expired links, password reset, session expiry, and sign-out as connected states.", rationale: "Each state should explain what happened, what the user can do now, and what remains protected.", tradeoff: "A complete state model requires more design and implementation work than polishing only the primary path." }, order: 2 },
    { projectId: securegate.id, type: "evidence", eyebrow: "Implemented evidence", title: "The working product connects interface feedback with server-side rules.", content: "", payload: { finding: "Sensitive flows need clear feedback without exposing unnecessary account information.", evidence: "The implementation includes registration, login, email verification, password recovery, session handling, protected routes, server validation, and rate limiting.", implication: "Interface copy and state transitions must reflect authoritative server responses; this implementation evidence is not a security certification." }, order: 3 },
    { projectId: securegate.id, type: "evidence", eyebrow: "Technical collaboration", title: "Design decisions accounted for implementation constraints.", content: "", payload: { finding: "Authentication behaviour depends on asynchronous and time-sensitive system states.", evidence: "The product handles API latency, validation, token expiry, session state, route protection, and the distinction between client feedback and server authority.", implication: "Technical fluency supports more realistic product specifications while remaining distinct from independent security review." }, order: 4 },
    { projectId: securegate.id, type: "reflection", eyebrow: "Learning", title: "Low friction means necessary steps are understandable and recoverable.", content: "The project reinforced that low friction does not mean removing every security step. Future work should test completion, error recovery, and comprehension with first-time and returning users.", payload: { body: "The project reinforced that low friction does not mean removing every security step. Future work should test completion, error recovery, and comprehension with first-time and returning users." }, order: 5 },
  ] });

  assert.equal(await tx.resumeExperience.count(), 0, "ResumeExperience changed after the preflight snapshot.");
  await tx.resumeExperience.createMany({ data: resumeExperiences });

  const linkedIn = await tx.socialLink.findFirst({ where: { platform: { equals: "LinkedIn", mode: "insensitive" } } });
  if (linkedIn) {
    await tx.socialLink.update({ where: { id: linkedIn.id }, data: { platform: "LinkedIn", url: "https://www.linkedin.com/in/abdulhameed-abdulsalam-305568149/", icon: "linkedin", order: 0 } });
  } else {
    await tx.socialLink.create({ data: { platform: "LinkedIn", url: "https://www.linkedin.com/in/abdulhameed-abdulsalam-305568149/", icon: "linkedin", order: 0 } });
  }
  if (duplicateSkills.length > 0) {
    await tx.skill.deleteMany({ where: { id: { in: duplicateSkills.map((skill) => skill.id) } } });
  }
});

const afterCounts = await Promise.all([
  prisma.project.count(),
  prisma.caseStudySection.count(),
  prisma.projectImage.count(),
  prisma.siteContent.count(),
  prisma.resumeExperience.count(),
  prisma.socialLink.count(),
  prisma.skill.count(),
]);
const updatedSecureGate = await prisma.project.findUniqueOrThrow({ where: { id: securegate.id }, include: { images: true, caseStudySections: true } });
const updatedGoFinancial = await prisma.project.findUniqueOrThrow({ where: { id: gofinancial.id }, include: { caseStudySections: true } });
const publicText = JSON.stringify({ projects: await prisma.project.findMany({ where: { published: true } }), sections: await prisma.caseStudySection.findMany() });
const forbiddenClaims = ["25+ interviews", "500+ users", "reduced the number of clicks", "120+", "WCAG 2.1 AA compliant", "production-ready authentication"];
const remainingForbiddenClaims = forbiddenClaims.filter((claim) => publicText.toLowerCase().includes(claim.toLowerCase()));

assert.equal(afterCounts[0], beforeCounts[0], "Project count changed.");
assert.equal(updatedSecureGate.images.length, 0, "SecureGate still has unrelated ProjectImage rows.");
assert.equal(updatedSecureGate.caseStudySections.length, 5, "SecureGate section replacement did not complete.");
assert.equal(updatedGoFinancial.caseStudySections.length, gofinancial.caseStudySections.length, "GoFinancial section count changed.");
assert.equal(afterCounts[4], resumeExperiences.length, "Resume experience population did not complete.");
assert.equal(remainingForbiddenClaims.length, 0, `Unsupported claims remain: ${remainingForbiddenClaims.join(", ")}`);

console.log(JSON.stringify({
  ...plan,
  result: "Recruiter-release CMS update complete",
  afterCounts: {
    project: afterCounts[0], caseStudySection: afterCounts[1], projectImage: afterCounts[2],
    siteContent: afterCounts[3], resumeExperience: afterCounts[4], socialLink: afterCounts[5], skill: afterCounts[6],
  },
  forbiddenClaimsRemaining: remainingForbiddenClaims,
}, null, 2));

await prisma.$disconnect();
