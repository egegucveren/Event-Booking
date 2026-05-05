const noticeMap: Record<string, { tone: "success" | "warning"; text: string }> = {
  "signed-out": { tone: "success", text: "You have been signed out." },
  "event-created": { tone: "success", text: "Event published successfully." },
  "event-updated": { tone: "success", text: "Event updated successfully." },
  "event-deleted": { tone: "warning", text: "Event deleted successfully." },
  "booking-created": { tone: "success", text: "Your booking has been confirmed." },
  "booking-cancelled": { tone: "warning", text: "The booking has been cancelled." },
  "role-updated": { tone: "success", text: "User role updated." },
  "user-deleted": { tone: "warning", text: "User removed from the system." },
  "ticket-resolved": { tone: "success", text: "Contact ticket marked as resolved." }
};

export function getNotice(slug?: string) {
  if (!slug) {
    return null;
  }

  return noticeMap[slug] ?? null;
}
