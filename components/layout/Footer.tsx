import { getFooterContent } from "@/lib/home-content-server";

// Figma "Footer": copyright left, portfolio version right (ADR-010 phase 5).
export default async function Footer() {
  const footer = await getFooterContent();
  return (
    <footer className="site-footer">
      <div className="home-shell site-footer-inner">
        <p>© {new Date().getFullYear()} {footer.copyrightName}</p>
        {footer.version && <p>{footer.version}</p>}
      </div>
    </footer>
  );
}
