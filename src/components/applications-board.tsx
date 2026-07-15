"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ApplicationModel } from "@/generated/prisma/models";
import {
  deleteApplication,
  updateApplication,
} from "@/actions/application-actions";
import { ApplicationsTable } from "@/components/applications-table";
import { AddJobDialog } from "@/components/add-job-dialog";
import { Input } from "@/components/ui/input";

export function ApplicationsBoard({
  initialApplications,
}: {
  initialApplications: ApplicationModel[];
}) {
  const [rows, setRows] = useState(initialApplications);
  const [globalFilter, setGlobalFilter] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  async function handlePatch(id: string, patch: Record<string, unknown>) {
    const previous = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } as ApplicationModel : r)));
    try {
      await updateApplication(id, patch);
    } catch {
      setRows(previous);
      toast.error("Couldn't save that change. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    const previous = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    try {
      await deleteApplication(id);
      toast.success("Application deleted");
    } catch {
      setRows(previous);
      toast.error("Couldn't delete that row. Please try again.");
    }
  }

  function handleCreated(app: ApplicationModel) {
    setRows((rs) => [app, ...rs]);
    setHighlightId(app.id);
    setTimeout(() => setHighlightId((current) => (current === app.id ? null : current)), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search company, role, or location..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <AddJobDialog onCreated={handleCreated} />
      </div>
      <ApplicationsTable
        rows={rows}
        onPatch={handlePatch}
        onDelete={handleDelete}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        highlightId={highlightId}
      />
    </div>
  );
}
