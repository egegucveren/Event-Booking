// Footer displayed on every page — contains navigation links and copyright notice.
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand__mark brand__mark--sm">PP</span>
          <span className="site-footer__name">PulsePass</span>
        </div>

        <nav className="site-footer__nav">
          <Link href="/">Home</Link>
          <Link href="/#events">Events</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <p className="site-footer__copy">
          &copy; {new Date().getFullYear()} PulsePass. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
