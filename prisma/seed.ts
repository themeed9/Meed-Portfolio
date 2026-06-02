import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  const projects = [
    {
      title: "PayFlow — Fintech Dashboard Redesign",
      slug: "payflow-fintech-dashboard",
      description: "Complete redesign of a fintech dashboard serving 50K+ users, improving task completion rate by 40% through information architecture restructuring and design system implementation.",
      category: "Product Design",
      tags: ["Fintech", "Dashboard", "Design System", "UX Research"],
      coverImage: "/images/projects/payflow-cover.jpg",
      featured: true,
      published: true,
      year: "2024",
      client: "PayFlow Inc.",
      role: "Lead Product Designer",
      duration: "3 months",
      tools: ["Figma", "Framer", "After Effects", "UsabilityHub"],
      overview: "PayFlow needed a comprehensive dashboard redesign to reduce user friction and support their growing feature set. The existing interface suffered from information overload and inconsistent design patterns.",
      challenge: "The main challenge was balancing data density with clarity. Financial dashboards require displaying complex information while maintaining quick scanability for traders making split-second decisions.",
      approach: "I led a design thinking process starting with 15 user interviews, followed by information architecture restructuring, component library creation, and iterative usability testing across 4 sprints.",
      results: "Task completion rate increased by 40%, user satisfaction scores improved by 62%, and the new design system reduced UI development time by 35%.",
      order: 1,
    },
    {
      title: "Bloom — AI-Powered E-commerce Platform",
      slug: "bloom-ai-ecommerce",
      description: "Designed the end-to-end UX for an AI-driven personalized shopping platform, featuring smart recommendations, visual search, and conversational checkout flow.",
      category: "UI/UX Design",
      tags: ["E-commerce", "AI", "Mobile", "Web App"],
      coverImage: "/images/projects/bloom-cover.jpg",
      featured: true,
      published: true,
      year: "2024",
      client: "Bloom Retail",
      role: "Product Designer",
      duration: "4 months",
      tools: ["Figma", "Figma Make", "Replit", "Claude AI"],
      overview: "Bloom is an AI-first e-commerce platform that leverages machine learning to create personalized shopping experiences. I designed the entire product experience from concept to handoff.",
      challenge: "Integrating AI features (visual search, smart recommendations) into a seamless shopping experience without overwhelming users or making the interface feel robotic.",
      approach: "Used iterative prototyping with AI-assisted design workflows. Created 50+ variants in Figma using Make automation, tested with 30 users, and refined based on behavioral analytics.",
      results: "Conversion rate improved by 28%, average session duration increased by 45%, and the AI recommendation engine achieved 92% relevance accuracy in user testing.",
      order: 2,
    },
    {
      title: "Vertex — SaaS Analytics Platform",
      slug: "vertex-saas-analytics",
      description: "End-to-end product design for a B2B SaaS analytics platform serving enterprise clients with real-time data visualization, collaborative workspaces, and role-based dashboards.",
      category: "Product Design",
      tags: ["SaaS", "Analytics", "Enterprise", "Data Viz"],
      coverImage: "/images/projects/vertex-cover.jpg",
      featured: true,
      published: true,
      year: "2023",
      client: "Vertex Analytics",
      role: "Senior Product Designer",
      duration: "6 months",
      tools: ["Figma", "Framer", "Principle", "Maze"],
      overview: "Vertex is a B2B analytics platform that needed a complete UX overhaul to compete with enterprise incumbents while maintaining their startup speed advantage.",
      challenge: "Enterprise analytics platforms are notoriously complex. We needed to simplify without losing power, and make data visualization accessible to non-technical stakeholders.",
      approach: "Conducted competitive analysis of 12 enterprise analytics tools, created a modular component architecture, and developed a progressive disclosure system for advanced features.",
      results: "NPS score improved from 32 to 68, enterprise deal close rate increased by 52%, and user onboarding time decreased from 4 days to 2 hours.",
      order: 3,
    },
    {
      title: "Nexa — Brand & Marketing Design",
      slug: "nexa-brand-design",
      description: "Comprehensive brand identity and marketing design for a Web3 startup, including logo, visual identity, social media templates, and investor presentation deck.",
      category: "Brand Design",
      tags: ["Brand Identity", "Marketing", "Web3", "Social Media"],
      coverImage: "/images/projects/nexa-cover.jpg",
      featured: false,
      published: true,
      year: "2023",
      client: "Nexa Protocol",
      role: "Brand Designer",
      duration: "2 months",
      tools: ["Figma", "Illustrator", "After Effects", "Premiere Pro"],
      overview: "Nexa needed a complete brand identity from the ground up — including logo, color system, typography, social media templates, and a pitch deck for their Series A fundraising.",
      challenge: "The Web3 space is visually saturated. We needed to stand out while communicating trust and technical sophistication to both crypto-native users and traditional investors.",
      approach: "Started with brand strategy workshops, explored 20+ logo directions, developed a geometric brand system inspired by network topology, and created templates for consistent execution.",
      results: "The brand launched successfully at Token2049, the Series A deck contributed to raising $4.2M, and social media engagement grew 340% in the first quarter.",
      order: 4,
    },
  ];

  for (const project of projects) {
    const created = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });

    await prisma.caseStudySection.createMany({
      data: [
        {
          projectId: created.id,
          title: "Research & Discovery",
          content: "## Understanding the User\n\nWe began with comprehensive user research including stakeholder interviews, competitive analysis, and user behavior analytics. This phase involved 25+ interviews and a survey of 500+ users to identify pain points and opportunities.\n\n### Key Findings\n\n- Users struggled with information overload\n- Navigation was confusing and non-intuitive\n- Mobile experience was severely lacking\n- Users wanted more personalization options",
          order: 1,
        },
        {
          projectId: created.id,
          title: "Information Architecture",
          content: "## Restructuring the Experience\n\nBased on research insights, I redesigned the information architecture using card sorting and tree testing methodologies. The new structure reduced the number of clicks to reach key features by 60%.\n\n### New IA Structure\n\n- Simplified top-level navigation from 8 to 4 items\n- Created context-aware secondary navigation\n- Implemented smart search with predictive results\n- Designed progressive disclosure for advanced features",
          order: 2,
        },
        {
          projectId: created.id,
          title: "Design System",
          content: "## Building for Consistency\n\nI developed a comprehensive design system using Figma's component library features. This included typography scales, color tokens, spacing system, and 120+ reusable components.\n\n### System Highlights\n\n- 120+ production-ready components\n- Dark and light mode support\n- Responsive grid system\n- Accessibility-first approach (WCAG 2.1 AA compliant)\n- Developer handoff with Storybook documentation",
          order: 3,
        },
        {
          projectId: created.id,
          title: "Visual Design",
          content: "## Crafting the Visual Experience\n\nThe visual design focused on clarity, hierarchy, and emotional resonance. I used a restrained color palette with strategic accent colors to guide attention and create visual rhythm.",
          order: 4,
        },
      ],
    });

    await prisma.projectImage.createMany({
      data: [
        { projectId: created.id, url: `/images/projects/${project.slug}-1.jpg`, alt: `${project.title} - Main view`, order: 1 },
        { projectId: created.id, url: `/images/projects/${project.slug}-2.jpg`, alt: `${project.title} - Detail view`, order: 2 },
        { projectId: created.id, url: `/images/projects/${project.slug}-3.jpg`, alt: `${project.title} - Mobile view`, order: 3 },
      ],
    });
  }

  const skills = [
    { name: "Product Design", category: "Product Design", proficiency: 95, order: 1 },
    { name: "UI/UX Design", category: "Product Design", proficiency: 95, order: 2 },
    { name: "Figma", category: "Tools", proficiency: 98, order: 3 },
    { name: "Design Systems", category: "Product Design", proficiency: 92, order: 4 },
    { name: "User Research", category: "UX", proficiency: 88, order: 5 },
    { name: "Prototyping", category: "Product Design", proficiency: 90, order: 6 },
    { name: "AI-Assisted Design", category: "AI Tools", proficiency: 85, order: 7 },
    { name: "Figma Make", category: "Tools", proficiency: 82, order: 8 },
    { name: "Brand Identity", category: "Brand Design", proficiency: 85, order: 9 },
    { name: "Motion Design", category: "Creative", proficiency: 78, order: 10 },
    { name: "Social Media Design", category: "Brand Design", proficiency: 88, order: 11 },
    { name: "HTML/CSS", category: "Technical", proficiency: 80, order: 12 },
    { name: "Content Design", category: "Creative", proficiency: 82, order: 13 },
    { name: "AI Storytelling", category: "AI Tools", proficiency: 75, order: 14 },
  ];

  for (const skill of skills) {
    await prisma.skill.create({ data: skill });
  }

  const services = [
    { title: "Product Design", description: "End-to-end product design from research to high-fidelity prototypes. I design digital products that are intuitive, accessible, and business-driven.", icon: "Palette", order: 1 },
    { title: "UI/UX Design", description: "User-centered interface design with a focus on clarity, hierarchy, and emotional resonance. Every pixel serves a purpose.", icon: "PenTool", order: 2 },
    { title: "Design Systems", description: "Scalable component libraries and design tokens that ensure consistency across your entire product ecosystem.", icon: "Layers", order: 3 },
    { title: "AI-Enhanced Prototyping", description: "Rapid prototyping using AI-assisted workflows to explore more concepts faster and validate ideas with real users.", icon: "Zap", order: 4 },
    { title: "Brand & Visual Identity", description: "Cohesive brand systems including logos, color palettes, typography, and visual guidelines that communicate your unique value.", icon: "Sparkles", order: 5 },
    { title: "Marketing & Social Design", description: "Engaging marketing visuals, social media templates, and content design that drives conversion and brand recognition.", icon: "Megaphone", order: 6 },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Product",
      company: "PayFlow Inc.",
      content: "Abdulhameed transformed our product experience. His design leadership elevated our dashboard from functional to exceptional. The 40% improvement in task completion speaks for itself.",
      rating: 5,
      featured: true,
      order: 1,
    },
    {
      name: "Marcus Johnson",
      role: "CTO",
      company: "Bloom Retail",
      content: "Working with Abdulhameed was a game-changer for our platform. His AI-first design approach helped us create an experience that truly feels like the future of shopping.",
      rating: 5,
      featured: true,
      order: 2,
    },
    {
      name: "Elena Rodriguez",
      role: "CEO",
      company: "Vertex Analytics",
      content: "The UX overhaul Abdulhameed delivered was instrumental in our enterprise market expansion. Our NPS jumped from 32 to 68 — the best ROI we've seen from any design engagement.",
      rating: 5,
      featured: true,
      order: 3,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }

  const socialLinks = [
    { platform: "LinkedIn", url: "https://linkedin.com/in/meed", icon: "linkedin", order: 1 },
    { platform: "Twitter", url: "https://twitter.com/meed", icon: "twitter", order: 2 },
    { platform: "Dribbble", url: "https://dribbble.com/meed", icon: "dribbble", order: 3 },
    { platform: "GitHub", url: "https://github.com/meed", icon: "github", order: 4 },
  ];

  for (const link of socialLinks) {
    await prisma.socialLink.create({ data: link });
  }

  const siteContent = [
    {
      key: "homepage-hero",
      value: {
        title: "Product Designer\nwith an AI Edge",
        subtitle: "I design clear, usable, developer-friendly digital products using Figma, AI workflows, and design systems thinking.",
        ctaText: "View My Work",
        ctaLink: "/work",
        secondaryCtaText: "Get in Touch",
        secondaryCtaLink: "/contact",
      },
    },
    {
      key: "homepage-about",
      value: {
        title: "Designing at the Intersection of Creativity & AI",
        paragraphs: [
          "With 5 years of experience in product and UI/UX design, I specialize in creating digital products that are not just beautiful but deeply functional. My approach combines design thinking with AI-assisted workflows to ship faster without compromising quality.",
          "From fintech dashboards to e-commerce platforms, I've helped startups and enterprises turn complex problems into intuitive, human-centered experiences. I believe great design is invisible — it guides, empowers, and delights without getting in the way.",
        ],
        imageUrl: "/images/about-me.jpg",
      },
    },
    {
      key: "homepage-impact",
      value: {
        stat1: { value: "50+", label: "Projects Delivered" },
        stat2: { value: "5+", label: "Years Experience" },
        stat3: { value: "30+", label: "Happy Clients" },
        stat4: { value: "98%", label: "Client Satisfaction" },
      },
    },
    {
      key: "homepage-workflow",
      value: {
        title: "AI + Figma: My Design Workflow",
        description: "I leverage AI tools throughout my design process — from research synthesis and ideation to prototyping and developer handoff. This means faster iterations, more explored concepts, and better outcomes.",
        steps: [
          { number: "01", title: "Research & Synthesize", description: "AI-assisted user research analysis, pattern recognition, and insight generation from raw data." },
          { number: "02", title: "Ideate & Explore", description: "Generate 10x more concepts using AI ideation partners, then refine with design thinking." },
          { number: "03", title: "Design & Prototype", description: "Rapid component creation in Figma, automated with Make workflows and AI-powered layout suggestions." },
          { number: "04", title: "Test & Iterate", description: "AI-driven usability testing analysis, heatmap prediction, and data-informed iteration cycles." },
          { number: "05", title: "Handoff & Deliver", description: "Automated design token export, developer-friendly specs, and Storybook integration via AI pipelines." },
        ],
      },
    },
  ];

  for (const content of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: { value: content.value },
      create: content,
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
