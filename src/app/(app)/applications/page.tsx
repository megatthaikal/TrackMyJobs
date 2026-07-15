import { listApplications } from "@/actions/application-actions";
import { ApplicationsBoard } from "@/components/applications-board";
import { FadeIn } from "@/components/fade-in";

// The "paste a link" auto-extract server action can fall back to headless
// browser rendering for JS-heavy sites, which takes longer than the
// platform's default function timeout — raise the budget for this route.
export const maxDuration = 60;

export default async function ApplicationsPage() {
  const applications = await listApplications();

  return (
    <div className="flex flex-col gap-4">
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">
          Applications
        </h1>
        <p className="text-sm text-muted-foreground">
          Your job search, spreadsheet-free. Click any cell to edit it
          in place.
        </p>
      </FadeIn>
      <FadeIn delay={0.08}>
        <ApplicationsBoard initialApplications={applications} />
      </FadeIn>
    </div>
  );
}
