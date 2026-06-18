import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  coverImage: z.string().optional(),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  year: z.string().optional(),
  client: z.string().optional(),
  role: z.string().optional(),
  duration: z.string().optional(),
  tools: z.string().optional(),
  overview: z.string().optional(),
  challenge: z.string().optional(),
  approach: z.string().optional(),
  results: z.string().optional(),
  testimonial: z.string().optional(),
  testimonialAuthor: z.string().optional(),
});

export const siteContentSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.any(),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  icon: z.string().optional(),
  proficiency: z.coerce.number().min(0).max(100),
});

export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  avatar: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  featured: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const resumeExperienceSchema = z.object({
  year: z.string().min(1, "Year is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  description: z.string().min(1, "Description is required"),
  order: z.coerce.number().int().min(0).default(0),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type SiteContentFormData = z.infer<typeof siteContentSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type ResumeExperienceFormData = z.infer<typeof resumeExperienceSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
