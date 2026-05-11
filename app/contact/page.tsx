// Contact page: shares support details and lets visitors send a message to the team.
import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact — PulsePass",
  description: "Get in touch with the PulsePass team."
};

export default function ContactPage() {
  return (
    <section className="section stack-xl">
      <div className="section-heading">
        <p className="eyebrow">Contact us</p>
        <h1>Get in Touch</h1>
        <p>Have a question or want to work with us? We would love to hear from you.</p>
      </div>

      <div className="contact-grid">
        <div className="glass-panel stack-md">
          <h2>Contact Details</h2>
          <ul className="contact-list">
            <li>
              <span className="contact-list__label">Email</span>
              <span>hello@pulsepass.ie</span>
            </li>
            <li>
              <span className="contact-list__label">Phone</span>
              <span>+353 1 234 5678</span>
            </li>
            <li>
              <span className="contact-list__label">Address</span>
              <span>South Circular Road, Dublin 8, Ireland</span>
            </li>
            <li>
              <span className="contact-list__label">Hours</span>
              <span>Monday – Friday, 9:00 am – 5:00 pm</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel stack-md">
          <h2>Send a Message</h2>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
