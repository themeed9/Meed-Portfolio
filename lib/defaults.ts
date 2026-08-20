export const fallbackProjects = [
  {
    id: "backrock",
    title: "BackRock Insurance",
    slug: "backrock-insurance",
    description: "Designing trust and clarity into a complex financial-services decision across responsive web touchpoints.",
    category: "Financial services · Responsive web · UX/UI design",
    tags: ["Trust UX", "Information architecture", "Responsive web", "Accessibility"],
    coverImage: "/uploads/1782128844597-LANDD.png",
    liveUrl: null,
    githubUrl: null,
    featured: true,
    published: true,
    year: null,
    client: "BackRock Insurance",
    role: "Product / UX Designer",
    duration: null,
    tools: ["Figma", "Responsive prototyping"],
    overview: "BackRock Insurance is framed as a trust and comprehension problem: helping people understand a consequential financial service, compare what matters, and move forward without avoidable ambiguity.",
    challenge: "Insurance decisions combine unfamiliar terminology, risk, and high information density. The experience needed to establish credibility while making products, benefits, next steps, and supporting information easier to scan across screen sizes.",
    approach: "The design uses clearer information hierarchy, progressive disclosure, consistent explanation patterns, and responsive components to support decision-making. Visual polish serves comprehension and trust rather than acting as a substitute for them.",
    results: "The documented outcome is a structured responsive experience and reusable interface direction. Conversion or comprehension improvements are not claimed because supporting measurement is not present in the repository.",
    testimonial: null,
    testimonialAuthor: null,
    order: 2,
    images: [],
    caseStudySections: [
      { id: "br-1", title: "03 — Evidence and constraints", content: "The repository does not document formal interviews, analytics, or conversion testing for this project. The case study therefore focuses on observable design constraints: complex service information, the need for credibility, responsive reading, and clear paths to action.", order: 1 },
      { id: "br-2", title: "04 — Problem framing", content: "Trust is treated as a product quality built through understandable language, predictable structure, visible supporting information, and consistent interaction—not as a visual style alone.\n\n## Design question\nHow might the experience help a prospective customer understand what is offered, why it may be relevant, and what happens next?", order: 2 },
      { id: "br-3", title: "06 — Information architecture", content: "Content is organised around decision needs: orientation, product explanation, benefits and conditions, evidence and reassurance, then next steps. Repeated page patterns reduce the effort of learning each section from scratch.", order: 3 },
      { id: "br-4", title: "07 — Responsive design system", content: "Foundations and semantic tokens support typography, colour, spacing, surfaces, and states. Reusable navigation, cards, content sections, controls, and calls-to-action keep the experience consistent as layouts move from wide editorial grids to a single-column mobile hierarchy.", order: 4 },
      { id: "br-5", title: "10 — Accessibility", content: "The design direction prioritises readable type, sufficient contrast, descriptive labels, visible focus, keyboard-reachable navigation, touch-friendly controls, clear error communication, and content that remains understandable without motion. Formal compliance testing is still required.", order: 5 },
      { id: "br-6", title: "14 — Reflection", content: "A future iteration should validate comprehension with prospective customers and insurance specialists, then measure where people hesitate or abandon the journey. That evidence would determine whether hierarchy, language, or product fit is the primary source of friction.", order: 6 },
    ],
  },
  {
    id: "securegate",
    title: "SecureGate",
    slug: "securegate",
    description: "Balancing security requirements with low-friction, understandable account access and recovery.",
    category: "SaaS · Authentication · Product design & implementation",
    tags: ["Authentication", "Systems thinking", "Interaction design", "Technical fluency"],
    coverImage: "/uploads/1781813874599-RewardScreen.png",
    liveUrl: null,
    githubUrl: null,
    featured: true,
    published: true,
    year: null,
    client: "Product concept",
    role: "Product Designer",
    duration: null,
    tools: ["Figma", "React", "Authentication patterns"],
    overview: "SecureGate examines a systems problem that is easy to underestimate: how to make signup, login, verification, protected states, and account recovery understandable without weakening the security model.",
    challenge: "Authentication is not one screen. It is a network of happy paths, errors, time-sensitive states, security constraints, and recovery routes. The product challenge was to make that system legible while keeping user effort proportionate to risk.",
    approach: "The work maps account creation, login, email verification, password reset, protected routes, validation, loading, expiration, and recovery as connected states. Interface decisions are tied to implementation realities such as session handling, API responses, and asynchronous feedback.",
    results: "The outcome is a reusable authentication experience and state model. No security, completion-rate, or commercial outcome is claimed without testing evidence.",
    testimonial: null,
    testimonialAuthor: null,
    order: 3,
    images: [],
    caseStudySections: [
      { id: "sg-1", title: "02 — The system problem", content: "A secure flow can still fail users when requirements, current status, and recovery paths are unclear. SecureGate frames authentication as a product system: identity, session, verification, protected content, failure, and recovery must remain coherent together.", order: 1 },
      { id: "sg-2", title: "06 — Flow and edge cases", content: "The flow model covers signup, duplicate accounts, password rules, login, invalid credentials, email verification, expired links, resend behaviour, password reset, protected routes, session expiry, and sign-out. Each state answers three questions: what happened, what the user can do now, and what remains protected.", order: 2 },
      { id: "sg-3", title: "08 — Interaction design", content: "Loading, success, validation, error, disabled, focus, and recovery states are designed as first-class parts of the experience. Feedback is placed near the action that caused it, while sensitive errors avoid revealing unnecessary account information.", order: 3 },
      { id: "sg-4", title: "12 — Engineering collaboration", content: "Design decisions account for API latency, server validation, token expiry, session state, route protection, and the difference between client feedback and authoritative server responses. This technical fluency supports clearer specifications and more realistic prototypes; it does not replace security review.", order: 4 },
      { id: "sg-5", title: "14 — Reflection", content: "The work reinforces that low friction does not mean removing every step. It means making each necessary step understandable, proportionate, and recoverable. Future testing should compare completion, error recovery, and comprehension across first-time and returning users.", order: 5 },
    ],
  },
];

export const fallbackSkills = [
  { id: "1", name: "Product strategy & framing", category: "Product practice", proficiency: 0, order: 1 },
  { id: "2", name: "UX research & synthesis", category: "Product practice", proficiency: 0, order: 2 },
  { id: "3", name: "Interaction & responsive design", category: "Product practice", proficiency: 0, order: 3 },
  { id: "4", name: "Design systems", category: "Product practice", proficiency: 0, order: 4 },
  { id: "5", name: "Prototyping & usability testing", category: "Product practice", proficiency: 0, order: 5 },
  { id: "6", name: "Implementation collaboration", category: "Technical fluency", proficiency: 0, order: 6 },
  { id: "7", name: "React, Next.js & TypeScript", category: "Technical fluency", proficiency: 0, order: 7 },
  { id: "8", name: "APIs, authentication & Git", category: "Technical fluency", proficiency: 0, order: 8 },
];

export const fallbackServices = [];
export const fallbackTestimonials = [];
export const fallbackSocialLinks = [
  { id: "1", platform: "LinkedIn", url: "https://linkedin.com/in/meedport", icon: "linkedin", order: 1 },
  { id: "2", platform: "GitHub", url: "https://github.com/meedport", icon: "github", order: 2 },
];
export const fallbackResume = { fileUrl: "/uploads/1782291017242-AbdulhameedProductDesignerResume1.pdf", version: "1.0" };
export const fallbackResumeExperiences = [
  { id: "1", year: "2023 – Present", title: "UI/UX Designer", company: "TrustBanc Microfinance Bank", description: "Design customer-facing and internal fintech experiences, translating product requirements into user flows, responsive interfaces, prototypes, reusable patterns, and implementation-ready specifications in collaboration with product, engineering, and business stakeholders.", order: 1 },
  { id: "2", year: "2023 – Present", title: "Product Designer", company: "DealRide Autos", description: "Design responsive product experiences for vehicle discovery, comparison, and purchase decision-making, working across UX structure, content hierarchy, interface design, and engineering collaboration.", order: 2 },
  { id: "3", year: "2019 – Present", title: "Freelance Product / UX Designer", company: "Self-employed", description: "Design digital products across fintech, services, and e-commerce, including product flows, wireframes, prototypes, responsive interfaces, and reusable design systems.", order: 3 },
];
export const fallbackResumeSummary = "Product Designer focused on clear, scalable digital products across fintech, SaaS, mobile, and responsive web.";
export const fallbackResumeSkills = ["Product strategy", "UX research", "Interaction design", "Design systems", "Responsive design", "Prototyping", "Engineering collaboration"];
export const fallbackResumeCompetencies = fallbackResumeSkills;
export const fallbackResumeTools = [
  { name: "Figma", category: "Design & prototyping" },
  { name: "React / Next.js", category: "Implementation fluency" },
  { name: "Git", category: "Engineering collaboration" },
  { name: "AI-assisted workflows", category: "Synthesis, exploration & documentation" },
];
export const fallbackResumeEducation: { degree: string; school: string }[] = [];
export const fallbackResumeCertifications: { name: string; issuer: string; year: string }[] = [];

export const fallbackHero = {
  identityName: "Abdulhameed Abdulsalam",
  role: "Product Designer",
  title: "Designing clear, scalable digital products from complex problems.",
  subtitle: "I combine product thinking, UX, interaction design, systems thinking and technical fluency to turn ambiguous problems into usable, implementable products.",
  ctaText: "View selected work",
  ctaLink: "#selected-work",
  secondaryCtaText: "About me",
  secondaryCtaLink: "/about",
  slides: [
    { src: "/uploads/1782128853745-PRTFL.png", alt: "Product interface work from Abdulhameed's portfolio" },
    { src: "/uploads/1782128844597-LANDD.png", alt: "Responsive product design work" },
  ],
};

export const fallbackAbout = {
  title: "I design products by understanding the system around the screen.",
  paragraphs: [
    "My background spans product design, research, visual communication, and technical product building. That range helps me connect user behaviour, business objectives, and implementation constraints rather than treating design as an isolated layer.",
    "I am most useful on ambiguous problems that need structure: clarifying what matters, making decisions visible, building reusable patterns, and working closely with engineering to carry the experience through implementation.",
  ],
  imageUrl: "/uploads/1782129256804-Profileimage.png",
};

export const fallbackWorkflow = {
  title: "AI-enhanced product workflow",
  description: "I use AI where it improves speed, exploration, or synthesis, while keeping product decisions grounded in user evidence, business context, and design judgment.",
  steps: [
    { number: "01", title: "Synthesis", description: "Organise source material and identify themes for review—not replace primary evidence." },
    { number: "02", title: "Exploration", description: "Generate alternatives quickly, then evaluate them against product principles and constraints." },
    { number: "03", title: "Prototyping", description: "Move from interaction hypotheses to testable product behaviour with implementation in mind." },
    { number: "04", title: "Documentation", description: "Clarify states, decisions, and handoff details so teams can act on them." },
  ],
};
