"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Send, Mail, MapPin, CheckCircle } from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { fadeInUp } from "@/lib/motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.contactEmail) setContactEmail(data.contactEmail);
      })
      .catch(() => {});
  }, []);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema) as any,
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            variants={fadeInUp}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
          >
            <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
              Contact
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-text-primary">
              Let&apos;s Work Together
            </h1>
            <p className="mt-4 text-text-tertiary leading-relaxed max-w-md">
              Have a project in mind or just want to say hello? Fill out the form and I&apos;ll get back to you within 24 hours.
            </p>

            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center text-text-accent" aria-hidden="true">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Email</p>
                  <p className="font-medium text-text-primary">{contactEmail || "hello@meedport.com"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center text-text-accent" aria-hidden="true">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Location</p>
                  <p className="font-medium text-text-primary">Remote — Available Worldwide</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            {isSubmitted ? (
              <div className="p-12 rounded-2xl bg-primary-subtle border border-primary-base/20 text-center" role="status" aria-live="polite">
                <CheckCircle size={48} className="text-primary-base mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">Message Sent!</h3>
                <p className="text-text-tertiary">Thank you for reaching out. I&apos;ll respond within 24 hours.</p>
                <Button variant="outline" className="mt-6" onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Name *" placeholder="Your name" error={errors.name?.message} {...register("name")} />
                  <Input label="Email *" type="email" placeholder="your@email.com" error={errors.email?.message} {...register("email")} />
                </div>
                <Input label="Subject" placeholder="What's this about?" {...register("subject")} />
                <Textarea label="Message *" placeholder="Tell me about your project..." rows={6} error={errors.message?.message} {...register("message")} />
                <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
                  <Send size={16} />
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
