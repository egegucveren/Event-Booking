import { adminDeleteEventAction, deleteUserAction } from "@/actions/admin";
import { resolveTicketAction } from "@/actions/contact";
import { RoleSelectForm } from "@/components/ui/role-select-form";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth";
import { formatEventDate } from "@/lib/format";
import { getNotice } from "@/lib/notices";
import { getAdminRecentEvents, getAdminUsers, getLandingStats, getOpenContactTickets } from "@/lib/queries";
import type { Role } from "@/lib/types";

type AdminPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

const roleOptions: Role[] = ["admin", "organiser", "attendee"];

function getRoleTone(role: Role) {
  return role === "admin" ? "warning" : "success";
}

function getEventStatusTone(status: "scheduled" | "cancelled") {
  return status === "scheduled" ? "success" : "warning";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const admin = await requireRole("admin");
  const [users, recentEvents, stats, tickets] = await Promise.all([
    getAdminUsers(),
    getAdminRecentEvents(),
    getLandingStats(),
    getOpenContactTickets()
  ]);
  const notice = getNotice((await searchParams)?.notice);
  const metrics = [
    { label: "Users", value: users.length },
    { label: "Events", value: stats.totalEvents },
    { label: "Seats booked", value: stats.totalBookings },
    { label: "Cities active", value: stats.totalCities }
  ];

  return (
    <section className="section stack-xl">
      {notice ? <NoticeBanner text={notice.text} tone={notice.tone} /> : null}

      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Admin control room</p>
          <h1>Monitor the platform, manage users, and keep access roles aligned with the system rules.</h1>
          <p>
            Signed in as {admin.name}. This area demonstrates role-based access control and user management over the shared MySQL data model.
          </p>
        </div>
      </div>

      <div className="metric-grid metric-grid--dashboard">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="admin-layout">
        <div className="glass-panel stack-lg">
          <div className="section-heading">
            <p className="eyebrow">User management</p>
            <h2>Update roles or remove accounts</h2>
            <p>The admin can oversee organisers and attendees while preserving their own admin access.</p>
          </div>

          <div className="table-wrap">
            {users.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentAdmin = user.id === admin.id;
                    const targetIsAdmin = user.role === "admin";
                    const canEdit = !isCurrentAdmin && (admin.isOwner || !targetIsAdmin);

                    return (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </td>
                        <td>
                          <div className="row gap-sm">
                            <StatusBadge label={user.role} tone={getRoleTone(user.role)} />
                            {user.isOwner ? <StatusBadge label="Owner" tone="warning" /> : null}
                          </div>
                        </td>
                        <td>{formatEventDate(user.createdAt)}</td>
                        <td>
                          {user.eventsCreated} events / {user.bookingsMade} bookings
                        </td>
                        <td>
                          <div className="admin-actions">
                            {isCurrentAdmin ? (
                              <StatusBadge label="You" tone="default" />
                            ) : canEdit ? (
                              <>
                                <RoleSelectForm
                                  currentRole={user.role}
                                  roleOptions={roleOptions}
                                  userId={user.id}
                                />
                                <form action={deleteUserAction}>
                                  <input name="userId" type="hidden" value={user.id} />
                                  <button className={buttonClassName("danger", "sm")} type="submit">
                                    Delete
                                  </button>
                                </form>
                              </>
                            ) : (
                              <StatusBadge label="Admin" tone="default" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No users found" body="User accounts will appear here once people register for the platform." />
            )}
          </div>
        </div>

        <div className="glass-panel stack-lg">
          <div className="section-heading">
            <p className="eyebrow">Event management</p>
            <h2>All platform events</h2>
            <p>Admins can delete any event. All confirmed bookings will be cancelled automatically.</p>
          </div>

          <div className="stack-md">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <article className="activity-card" key={event.id}>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.organiserName} / {event.city}</p>
                  </div>
                  <div className="activity-card__meta">
                    <StatusBadge label={event.status} tone={getEventStatusTone(event.status)} />
                    <span>{event.bookedSeats} seats booked</span>
                    <span>{formatEventDate(event.startsAt)}</span>
                    <form action={adminDeleteEventAction}>
                      <input name="eventId" type="hidden" value={event.id} />
                      <button className={buttonClassName("danger", "sm")} type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No events found" body="Events created by organisers will appear here." />
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel stack-lg">
        <div className="section-heading">
          <p className="eyebrow">Support inbox</p>
          <h2>Contact tickets</h2>
          <p>Messages submitted via the Contact page. Open tickets are shown first.</p>
        </div>

        {tickets.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Sender</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{formatEventDate(ticket.createdAt)}</td>
                    <td>
                      <strong>{ticket.name}</strong>
                      <span>{ticket.email}</span>
                    </td>
                    <td className="ticket-message">{ticket.message}</td>
                    <td>
                      <StatusBadge
                        label={ticket.status}
                        tone={ticket.status === "open" ? "warning" : "success"}
                      />
                    </td>
                    <td>
                      {ticket.status === "open" ? (
                        <form action={resolveTicketAction}>
                          <input name="ticketId" type="hidden" value={ticket.id} />
                          <button className={buttonClassName("secondary", "sm")} type="submit">
                            Resolve
                          </button>
                        </form>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No tickets yet" body="Contact form submissions will appear here." />
        )}
      </div>
    </section>
  );
}
