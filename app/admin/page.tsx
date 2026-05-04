import { deleteUserAction, updateUserRoleAction } from "@/actions/admin";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth";
import { formatEventDate } from "@/lib/format";
import { getNotice } from "@/lib/notices";
import { getAdminRecentEvents, getAdminUsers, getLandingStats } from "@/lib/queries";
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
  const [users, recentEvents, stats] = await Promise.all([getAdminUsers(), getAdminRecentEvents(), getLandingStats()]);
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

                    return (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </td>
                        <td>
                          <StatusBadge label={user.role} tone={getRoleTone(user.role)} />
                        </td>
                        <td>{formatEventDate(user.createdAt)}</td>
                        <td>
                          {user.eventsCreated} events / {user.bookingsMade} bookings
                        </td>
                        <td>
                          <div className="row gap-sm wrap">
                            <form action={updateUserRoleAction} className="inline-form">
                              <input name="userId" type="hidden" value={user.id} />
                              <select
                                className="input input--compact"
                                defaultValue={user.role}
                                disabled={isCurrentAdmin}
                                name="role"
                              >
                                {roleOptions.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                              <button
                                className={buttonClassName("secondary", "sm")}
                                disabled={isCurrentAdmin}
                                type="submit"
                              >
                                Save
                              </button>
                            </form>

                            {isCurrentAdmin ? (
                              <StatusBadge label="Current admin" tone="default" />
                            ) : (
                              <form action={deleteUserAction}>
                                <input name="userId" type="hidden" value={user.id} />
                                <button className={buttonClassName("danger", "sm")} type="submit">
                                  Delete
                                </button>
                              </form>
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
            <p className="eyebrow">Recent event activity</p>
            <h2>Quick system view</h2>
            <p>A compact operational snapshot helps admins keep the whole application coordinated.</p>
          </div>

          <div className="stack-md">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <article className="activity-card" key={event.id}>
                  <div>
                    <h3>{event.title}</h3>
                    <p>
                      {event.organiserName} / {event.city}
                    </p>
                  </div>
                  <div className="activity-card__meta">
                    <StatusBadge label={event.status} tone={getEventStatusTone(event.status)} />
                    <span>{event.bookedSeats} seats booked</span>
                    <span>{formatEventDate(event.startsAt)}</span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No recent events" body="Newly created events will appear here for a quick admin overview." />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
