"use client";

// Cookie consent banner shown once to new visitors.
// Stores the user's choice in localStorage so it is not shown again.
import { useEffect, useState } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  // Only show after mount to avoid hydration mismatch with server render.
  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <strong>We use cookies</strong>
          <p>
            PulsePass uses cookies to keep you signed in and improve your experience.
            No personal data is shared with third parties.
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button className="button button--primary button--sm" onClick={accept} type="button">
            Accept
          </button>
          <button className="button button--ghost button--sm" onClick={decline} type="button">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
