// FAQ page: answers common booking, account, and organiser workflow questions.
import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

const faqGroups = [
  {
    title: "Booking",
    items: [
      {
        question: "How do I book tickets for an event?",
        answer:
          "Browse events on the home page, click on one you like, choose the number of seats, and confirm your booking. You need a registered attendee account to book."
      },
      {
        question: "Can I book multiple seats in one go?",
        answer:
          "Yes. You can reserve up to 6 seats per transaction. If you need more, please contact us directly."
      },
      {
        question: "How do I cancel a booking?",
        answer:
          "Log in to your attendee dashboard and click Cancel next to the booking you want to remove. The seats are returned to the event immediately."
      },
      {
        question: "Is there a refund policy?",
        answer:
          "Cancellations are accepted at any time before the event starts, but no monetary refund is issued — ticket payments are non-refundable once processed."
      },
      {
        question: "Why can I not book tickets as an organiser or admin?",
        answer:
          "Booking is reserved for attendee accounts. Organisers manage event listings, and admins oversee the platform — neither role can make reservations."
      }
    ]
  },
  {
    title: "Accounts",
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Click Create Account in the top navigation, fill in your name, email address, and choose whether you want an attendee or organiser account."
      },
      {
        question: "What is the difference between an attendee and an organiser?",
        answer:
          "Attendees browse and book events. Organisers create, edit, and manage their own event listings and can track bookings from their dashboard."
      },
      {
        question: "Can I change my account role after signing up?",
        answer:
          "Roles can only be changed by a platform administrator. If you need a different role, reach out via the Contact page."
      },
      {
        question: "I forgot my password — how do I reset it?",
        answer:
          "Password reset is not available in the current version. Please contact the platform admin through the Contact page for assistance."
      }
    ]
  },
  {
    title: "Events",
    items: [
      {
        question: "Who can create events on PulsePass?",
        answer:
          "Any organiser account can create events from the organiser dashboard. Organisers can also edit and delete their own listings at any time."
      },
      {
        question: "What event categories are available?",
        answer:
          "Events are grouped into six categories: Music, Workshop, Wellness, Food, Sports, and Community."
      },
      {
        question: "What happens if an event is cancelled?",
        answer:
          "When an organiser or admin cancels an event, all confirmed bookings for that event are automatically marked as cancelled."
      },
      {
        question: "Can I still see events that are sold out?",
        answer:
          "Yes. Sold-out events remain visible on the platform so you can save the date for future editions, but the booking button will be disabled."
      }
    ]
  },
  {
    title: "Payments",
    items: [
      {
        question: "What payment methods are accepted?",
        answer:
          "PulsePass currently runs in demo mode — no real payment is processed. Bookings are confirmed instantly without any charge."
      },
      {
        question: "Are ticket prices shown in Euro?",
        answer:
          "Yes. All prices are displayed in Euro (EUR) inclusive of any fees."
      },
      {
        question: "Will I receive a booking confirmation?",
        answer:
          "Your confirmed bookings appear immediately in your attendee dashboard with a unique booking reference code."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <section className="section stack-xl">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Help centre</p>
          <h1>Frequently asked questions about booking, accounts, and events.</h1>
          <p>
            Everything you need to know about using PulsePass — from creating an account to managing
            your bookings.
          </p>
        </div>
      </div>

      <div className="faq-layout">
        <aside className="glass-panel stack-md faq-aside">
          <p className="eyebrow">Still need help?</p>
          <h2>Can&rsquo;t find what you&rsquo;re looking for?</h2>
          <p>
            Browse upcoming events or send us a message through the contact page and we will get back
            to you as soon as possible.
          </p>
          <div className="row gap-sm wrap">
            <Link className={buttonClassName("primary", "sm")} href="/contact">
              Contact Us
            </Link>
            <Link className={buttonClassName("secondary", "sm")} href="/#events">
              Browse Events
            </Link>
          </div>
        </aside>

        <div className="faq-content stack-lg">
          {faqGroups.map((group) => (
            <section className="glass-panel stack-md" key={group.title}>
              <div className="section-heading">
                <p className="eyebrow">{group.title}</p>
                <h2>{group.title} questions</h2>
              </div>

              <div className="faq-list">
                {group.items.map((item) => (
                  <details className="faq-item" key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
