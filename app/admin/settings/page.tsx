"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import Button from "@/components/ui/Button";

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

const ICON_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "dribbble", label: "Dribbble" },
  { value: "github", label: "GitHub" },
];

const emptyLink = (order: number): SocialLink => ({
  platform: "",
  url: "",
  icon: "",
  order,
});

type ImageField = "logoUrl" | "ctaBgImage" | "footerBgImage" | "aboutImage";

function BgImageSection({
  title,
  description,
  imageUrl,
  uploading,
  inputRef,
  onUpload,
  onRemove,
}: {
  title: string;
  description: string;
  imageUrl: string | null;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-tertiary">{description}</p>
      </div>

      {imageUrl && (
        <div className="relative w-full h-40 rounded-xl border border-border-subtle overflow-hidden bg-surface-container-high">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="block w-full text-sm text-text-tertiary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-subtle file:text-text-accent hover:file:bg-primary-subtle/80 file:cursor-pointer cursor-pointer"
        />
        {uploading && <span className="text-sm text-text-tertiary">Uploading...</span>}
      </div>

      {imageUrl && (
        <button onClick={onRemove} className="text-sm text-primary-base hover:underline">
          Remove image
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aboutImageRef = useRef<HTMLInputElement>(null);
  const ctaBgRef = useRef<HTMLInputElement>(null);
  const footerBgRef = useRef<HTMLInputElement>(null);
  const [siteName, setSiteName] = useState("MEED");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [ctaBgImage, setCtaBgImage] = useState<string | null>(null);
  const [footerBgImage, setFooterBgImage] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [slides, setSlides] = useState<{ src: string; alt: string }[]>([]);
  const [slidesUploading, setSlidesUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/social-links").then((r) => r.json()),
      fetch("/api/hero-slides").then((r) => r.json()),
    ])
      .then(([settings, links, heroSlides]) => {
        setSiteName(settings.siteName || "MEED");
        setLogoUrl(settings.logoUrl || null);
        setAboutImage(settings.aboutImage || null);
        setCtaBgImage(settings.ctaBgImage || null);
        setFooterBgImage(settings.footerBgImage || null);
        setContactEmail(settings.contactEmail || "");
        setSocialLinks(links.length > 0 ? links : [emptyLink(0)]);
        setSlides(Array.isArray(heroSlides) ? heroSlides : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ImageField,
    setter: (v: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setter(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlidesUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setSlides((prev) => [...prev, { src: data.url, alt: file.name.replace(/\.[^/.]+$/, "") }]);
      }
    } catch {
      setError("Upload failed");
    } finally {
      setSlidesUploading(false);
    }
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateSlideAlt = (index: number, alt: string) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], alt };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const siteRes = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteName, logoUrl, aboutImage, ctaBgImage, footerBgImage, contactEmail }),
    });

    if (!siteRes.ok) {
      setError("Failed to save site settings");
      setSaving(false);
      return;
    }

    const slidesRes = await fetch("/api/hero-slides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides }),
    });

    if (!slidesRes.ok) {
      setError("Failed to save hero slides");
      setSaving(false);
      return;
    }

    const linksToSave = socialLinks.filter((l) => l.platform.trim() && l.url.trim());
    const socialRes = await fetch("/api/social-links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links: linksToSave.map((l, i) => ({ ...l, order: i })) }),
    });

    if (socialRes.ok) {
      router.refresh();
    } else {
      setError("Failed to save social links");
    }
    setSaving(false);
  };

  const removeImage = (field: ImageField, ref: React.RefObject<HTMLInputElement | null>) => {
    if (field === "logoUrl") setLogoUrl(null);
    if (field === "aboutImage") setAboutImage(null);
    if (field === "ctaBgImage") setCtaBgImage(null);
    if (field === "footerBgImage") setFooterBgImage(null);
    if (ref.current) ref.current.value = "";
  };

  const updateLink = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addLink = () => {
    setSocialLinks((prev) => [...prev, emptyLink(prev.length)]);
  };

  const removeLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= socialLinks.length) return;
    setSocialLinks((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  if (loading) {
    return <div className="text-center py-20 text-text-tertiary">Loading...</div>;
  }

  return (
    <div>
      <AdminHeader title="Site Settings" description="Manage your branding, images, and social links" />

      <div className="max-w-2xl space-y-8">
        <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
          <h2 className="text-lg font-semibold text-text-primary">Site Name</h2>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="block w-full rounded-xl border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:border-text-accent focus:ring-2 focus:ring-focus-ring/40 transition-colors"
            placeholder="MEED"
          />
        </div>

        <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
          <h2 className="text-lg font-semibold text-text-primary">Site Logo</h2>

          {logoUrl && (
            <div className="relative w-32 h-16 rounded-xl border border-border-subtle overflow-hidden bg-surface-container-high">
              <Image src={logoUrl} alt="Site logo" fill className="object-contain" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
               onChange={(e) => handleUpload(e, "logoUrl", setLogoUrl)}
              className="block w-full text-sm text-text-tertiary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-subtle file:text-text-accent hover:file:bg-primary-subtle/80 file:cursor-pointer cursor-pointer"
            />
            {uploading && <span className="text-sm text-text-tertiary">Uploading...</span>}
          </div>

          {logoUrl && (
            <button onClick={() => removeImage("logoUrl", fileInputRef)} className="text-sm text-primary-base hover:underline">
              Remove logo
            </button>
          )}
        </div>

        {/* ── About Image ─────────────────────────────────── */}
        <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
          <h2 className="text-lg font-semibold text-text-primary">About Page Photo</h2>

          {aboutImage && (
            <div className="relative w-32 h-40 rounded-xl border border-border-subtle overflow-hidden bg-surface-container-high">
              <Image src={aboutImage} alt="About photo" fill className="object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              ref={aboutImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "aboutImage", setAboutImage)}
              className="block w-full text-sm text-text-tertiary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-subtle file:text-text-accent hover:file:bg-primary-subtle/80 file:cursor-pointer cursor-pointer"
            />
            {uploading === "aboutImage" && <span className="text-sm text-text-tertiary">Uploading...</span>}
          </div>

          {aboutImage && (
            <button onClick={() => removeImage("aboutImage", aboutImageRef)} className="text-sm text-primary-base hover:underline">
              Remove photo
            </button>
          )}
        </div>

        {/* ── CTA Background ──────────────────────────────── */}
        <BgImageSection
          title="CTA Background"
          description="Background image for the call-to-action section before the footer"
          imageUrl={ctaBgImage}
          uploading={uploading === "ctaBgImage"}
          inputRef={ctaBgRef}
          onUpload={(e) => handleUpload(e, "ctaBgImage", setCtaBgImage)}
          onRemove={() => removeImage("ctaBgImage", ctaBgRef)}
        />

        {/* ── Contact Email ────────────────────────────────── */}
        <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Contact Email</h2>
            <p className="mt-1 text-sm text-text-tertiary">
              Email address where contact form submissions will be sent
            </p>
          </div>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="block w-full rounded-xl border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:border-text-accent focus:ring-2 focus:ring-focus-ring/40 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        {/* ── Footer Background ───────────────────────────── */}
        <BgImageSection
          title="Footer Background"
          description="Background image for the footer section"
          imageUrl={footerBgImage}
          uploading={uploading === "footerBgImage"}
          inputRef={footerBgRef}
          onUpload={(e) => handleUpload(e, "footerBgImage", setFooterBgImage)}
          onRemove={() => removeImage("footerBgImage", footerBgRef)}
        />

        {/* ── Hero Slides ──────────────────────────────────── */}
        <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Hero Slides</h2>
              <p className="mt-1 text-sm text-text-tertiary">
                Images displayed in the hero section slideshow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleSlideUpload}
              className="block w-full text-sm text-text-tertiary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-subtle file:text-text-accent hover:file:bg-primary-subtle/80 file:cursor-pointer cursor-pointer"
            />
            {slidesUploading && <span className="text-sm text-text-tertiary">Uploading...</span>}
          </div>

          {slides.length === 0 ? (
            <p className="text-sm text-text-tertiary py-4 text-center">
              No slides added yet. Upload images above.
            </p>
          ) : (
            <div className="space-y-3">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle bg-surface-container-low"
                >
                  <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-container-high">
                    <Image src={slide.src} alt={slide.alt} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={slide.alt}
                      onChange={(e) => updateSlideAlt(i, e.target.value)}
                      className="block w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-text-accent focus:ring-2 focus:ring-focus-ring/40 transition-colors"
                      placeholder="Alt text"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSlide(i, -1)}
                      disabled={i === 0}
                      className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move slide up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSlide(i, 1)}
                      disabled={i === slides.length - 1}
                      className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move slide down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => removeSlide(i)}
                      className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                      aria-label="Remove slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-surface-primary rounded-2xl border border-border-subtle space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Social Links</h2>
            <button
              onClick={addLink}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-accent hover:underline"
            >
              <Plus size={16} />
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {socialLinks.map((link, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-border-subtle bg-surface-container-low"
              >
                <div className="flex flex-col gap-1 pt-1.5">
                  <button
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="text-text-tertiary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <GripVertical size={14} />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">Platform</label>
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => updateLink(i, "platform", e.target.value)}
                      className="block w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-text-accent focus:ring-2 focus:ring-focus-ring/40 transition-colors"
                      placeholder="LinkedIn"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">URL</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      className="block w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-text-accent focus:ring-2 focus:ring-focus-ring/40 transition-colors"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">Icon</label>
                    <select
                      value={link.icon}
                      onChange={(e) => updateLink(i, "icon", e.target.value)}
                      className="block w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus:border-text-accent focus:ring-2 focus:ring-focus-ring/40 transition-colors"
                    >
                      <option value="">Auto</option>
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => removeLink(i)}
                  className="p-2 text-text-tertiary hover:text-error transition-colors mt-1"
                  aria-label="Remove link"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        <Button variant="primary" size="lg" onClick={handleSave} isLoading={saving}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
