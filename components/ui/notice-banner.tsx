import { classNames } from "@/lib/format";

type NoticeBannerProps = {
  tone: "success" | "warning";
  text: string;
};

export function NoticeBanner({ tone, text }: NoticeBannerProps) {
  return (
    <div className={classNames("notice-banner", tone === "success" ? "notice-banner--success" : "notice-banner--warning")}>
      {text}
    </div>
  );
}
