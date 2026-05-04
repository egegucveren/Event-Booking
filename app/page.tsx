import { EventSearch } from "@/components/event-search";
import { HomeMarketplace } from "@/components/home/home-marketplace";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { getSessionUser } from "@/lib/auth";
import { getNotice } from "@/lib/notices";
import { getFeaturedEvents, getLandingStats } from "@/lib/queries";

type HomePageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [events, stats, sessionUser] = await Promise.all([getFeaturedEvents(6), getLandingStats(), getSessionUser()]);
  const noticeSlug = (await searchParams)?.notice;
  const notice = getNotice(noticeSlug);

  const user = sessionUser
    ? {
        ctaHref: "/dashboard",
        ctaLabel: "Open My Dashboard",
        organiserHref: sessionUser.role === "organiser" ? "/organiser" : "/register",
        organiserLabel: sessionUser.role === "organiser" ? "Manage Listings" : "Start Selling"
      }
    : {
        ctaHref: "/register",
        ctaLabel: "Create Account",
        organiserHref: "/register",
        organiserLabel: "Start Selling"
      };

  return (
    <>
      {notice ? (
        <section className="section section--tight">
          <NoticeBanner text={notice.text} tone={notice.tone} />
        </section>
      ) : null}
      
      <EventSearch events={events} />
      <HomeMarketplace events={events} stats={stats} user={user} />
    </>
  );
}