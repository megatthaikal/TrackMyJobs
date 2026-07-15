import { listApplications } from "@/actions/application-actions";
import { ApplicationsBoard } from "@/components/applications-board";
import { FadeIn } from "@/components/fade-in";

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
