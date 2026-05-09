// About Us page: explains the purpose of PulsePass and how the platform works.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — PulsePass",
  description: "Learn about PulsePass and our mission to connect people through live events."
};

export default function AboutPage() {
  return (
    <section className="section stack-xl">
      <div className="section-heading">
        <p className="eyebrow">Who we are</p>
        <h1>About PulsePass</h1>
        <p>Connecting people through live experiences.</p>
      </div>

      <div className="about-grid">
        <div className="glass-panel stack-md">
          <h2>Our Mission</h2>
          <p>
            PulsePass was built to make event discovery and booking as simple as possible.
            Whether you are an organiser running a weekend workshop or an attendee looking
            for something new to try, our platform gives you the tools to make it happen.
          </p>
          <p>
            We believe great events bring communities together. Our goal is to remove
            the friction between organisers and their audience so that more people can
            share meaningful experiences.
          </p>
        </div>

        <div className="glass-panel stack-md">
          <h2>How It Works</h2>
          <ul className="about-list">
            <li>
              <strong>Organisers</strong> create and manage events, set ticket prices, and
              track bookings from a dedicated dashboard.
            </li>
            <li>
              <strong>Attendees</strong> browse upcoming events, reserve seats in seconds,
              and manage their bookings from one place.
            </li>
            <li>
              <strong>Admins</strong> oversee the platform, manage user accounts, and keep
              the system running smoothly.
            </li>
          </ul>
        </div>

        <div className="glass-panel stack-md">
          <h2>What We Value</h2>
          <div className="about-values">
            <div>
              <strong>Simplicity</strong>
              <p>Booking a seat should take seconds, not minutes.</p>
            </div>
            <div>
              <strong>Transparency</strong>
              <p>Clear pricing, real-time availability, no hidden fees.</p>
            </div>
            <div>
              <strong>Security</strong>
              <p>Your data is protected with industry-standard practices at every step.</p>
            </div>
            <div>
              <strong>Community</strong>
              <p>We exist to help people find events they will remember.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel stack-md">
          <h2>The Team</h2>
          <p>
            PulsePass is a student project developed as part of the BSc in Computing Science
            at Griffith College Dublin. It was designed and built by a small team passionate
            about full-stack web development, clean code, and good user experiences.
          </p>
        </div>
      </div>
    </section>
  );
}
