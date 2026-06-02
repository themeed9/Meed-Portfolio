"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, CheckCircle } from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Contact
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Let&apos;s Work Together
            </h1>
            <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Have a project in mind or just want to say hello? Fill out the form and I&apos;ll get back to you within 24 hours.
            </p>

            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">hello@meedport.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">Remote — Available Worldwide</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {isSubmitted ? (
              <div className="p-12 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-gray-500 dark:text-gray-400">Thank you for reaching out. I&apos;ll respond within 24 hours.</p>
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
