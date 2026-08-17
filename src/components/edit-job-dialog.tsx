"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ApplicationModel } from "@/generated/prisma/models";
import { ApplicationStatus, WorkType } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

type FormState = {
  company: string;
  role: string;
  status: string;
  datePosted: string;
  dateApplied: string;
  location: string;
  workType: string;
  jobUrl: string;
  salary: string;
  notes: string;
};

function toDateInputValue(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function appToForm(app: ApplicationModel): FormState {
  return {
    company: app.company,
    role: app.role,
    status: app.status,
    datePosted: toDateInputValue(app.datePosted),
    dateApplied: toDateInputValue(app.dateApplied),
    location: app.location ?? "",
    workType: app.workType ?? "NONE",
    jobUrl: app.jobUrl ?? "",
    salary: app.salary ?? "",
    notes: app.notes ?? "",
  };
}

export function EditJobDialog({
  app,
  onOpenChange,
  onSave,
}: {
  app: ApplicationModel | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: Record<string, unknown>) => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (app) setForm(appToForm(app));
  }, [app]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!app || !form) return;
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required.");
      return;
    }
    setPending(true);
    try {
      await onSave(app.id, {
        company: form.company,
        role: form.role,
        status: form.status as ApplicationStatus,
        datePosted: form.datePosted || null,
        dateApplied: form.dateApplied || null,
        location: form.location || null,
        workType: form.workType === "NONE" ? null : (form.workType as WorkType),
        jobUrl: form.jobUrl || null,
        salary: form.salary || null,
        notes: form.notes || null,
      });
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={!!app} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit application</DialogTitle>
          <DialogDescription>
            Update the details for this application.
          </DialogDescription>
        </DialogHeader>
        {form && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-company">Company *</Label>
                <Input
                  id="edit-company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-role">Role *</Label>
                <Input
                  id="edit-role"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => v && update("status", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v: ApplicationStatus) => STATUS_LABELS[v]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ApplicationStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Work Type</Label>
                <Select
                  value={form.workType}
                  onValueChange={(v) => v && update("workType", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v: string) =>
                        v === "NONE" ? "—" : WORK_TYPE_LABELS[v as WorkType]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">—</SelectItem>
                    {Object.values(WorkType).map((w) => (
                      <SelectItem key={w} value={w}>
                        {WORK_TYPE_LABELS[w]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-datePosted">Date Posted</Label>
                <Input
                  id="edit-datePosted"
                  type="date"
                  value={form.datePosted}
                  onChange={(e) => update("datePosted", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-dateApplied">Date Applied</Label>
                <Input
                  id="edit-dateApplied"
                  type="date"
                  value={form.dateApplied}
                  onChange={(e) => update("dateApplied", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Remote, NYC"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-salary">Salary</Label>
                <Input
                  id="edit-salary"
                  value={form.salary}
                  onChange={(e) => update("salary", e.target.value)}
                  placeholder="e.g. $120k-$140k"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-jobUrl">Job Link</Label>
              <Input
                id="edit-jobUrl"
                type="url"
                value={form.jobUrl}
                onChange={(e) => update("jobUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
