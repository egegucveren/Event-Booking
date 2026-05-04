import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

const faqGroups = [
  {
    title: "Booking",
    items: [
      {
        question: "How do attendees book seats?",
        answer:
          "Attendees log in, open an event detail page, choose the number of seats, and submit the booking form. The system checks capacity before confirming the booking."
      },
      {
        question: "Can attendees cancel a booking?",
        answer:
          "Yes. Confirmed bookings can be cancelled from the attendee dashboard, and the seats return to the event availability count."
      },
      {
        question: "Can I get a refund after cancelling?",
        answer:
          "Unfortunately, refunds are not available once a ticket has been purchased."
      },
      {
        question: "Why can I not book as an organiser or admin?",
        answer:
          "Booking is limited to attendee accounts. Organisers manage listings, while admins manage users and monitor platform activity."
      }
    ]
  },
  {
    title: "Accounts",
    items: [
      {
        question: "Which demo accounts are available?",
        answer:
          "After running the seed script, you can use admin@pulsepass.local, organiser@pulsepass.local, or attendee@pulsepass.local with the password Passo123!."
      },
      {
        question: "Where does each role go after login?",
        answer:
          "Admins are sent to the admin panel, organisers to the organiser dashboard, and attendees to their booking dashboard."
      },
      {
        question: "Can admins change their own role?",
        answer:
          "The server protects admin access, and the admin page also disables the current admin's role controls to avoid accidental changes."
      }
    ]
  },
  {
    title: "Events",
    items: [
      {
        question: "Who can create and manage events?",
        answer:
          "Organiser accounts can create, edit, and delete their own events. Admins can monitor recent platform activity from the admin area."
      },
      {
        question: "How are categories and cities shown?",
        answer:
          "The homepage builds category and city filters from the active event data, so seeded or newly created events appear in the filters automatically."
      },
      {
        question: "What happens when an event is full?",
        answer:
          "When confirmed bookings reach the event capacity, the event is shown as sold out and attendees cannot reserve more seats."
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
          <h1>Answers for booking seats, managing events, and using demo accounts.</h1>
          <p>
            A quick reference for the core PulsePass workflows: attendees book, organisers manage events, and admins keep
            the platform coordinated.
          </p>
        </div>
      </div>

      <div className="faq-layout">
        <aside className="glass-panel stack-md faq-aside">
          <p className="eyebrow">Quick start</p>
          <h2>Need to test the app?</h2>
          <p>Run the seed script, log in with a demo account, and open the dashboard for that role.</p>
          <div className="row gap-sm wrap">
            <Link className={buttonClassName("primary", "sm")} href="/login">
              Log In
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
