"use client";

import { useState } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ApplicationModel } from "@/generated/prisma/models";
import { ApplicationStatus, WorkType } from "@/generated/prisma/enums";
import { createApplication } from "@/actions/application-actions";
import { extractJob } from "@/actions/extract-actions";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

const emptyForm = {
  company: "",
  role: "",
  status: ApplicationStatus.SAVED as string,
  datePosted: "",
  dateApplied: "",
  location: "",
  workType: "NONE",
  jobUrl: "",
  salary: "",
  notes: "",
};

export function AddJobDialog({
  onCreated,
}: {
  onCreated: (app: ApplicationModel) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState("link");
  const [linkUrl, setLinkUrl] = useState("");
  const [extracting, setExtracting] = useState(false);

  function update<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm(emptyForm);
    setLinkUrl("");
    setTab("link");
  }

  async function handleExtract() {
    if (!linkUrl.trim()) {
      toast.error("Paste a job posting URL first.");
      return;
    }
    setExtracting(true);
    try {
      const result = await extractJob(linkUrl.trim());
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { data } = result;
      setForm((f) => ({
        ...f,
        company: data.company ?? f.company,
        role: data.role ?? f.role,
        location: data.location ?? f.location,
        workType: data.workType ?? f.workType,
        datePosted: data.datePosted ?? f.datePosted,
        salary: data.salary ?? f.salary,
        jobUrl: linkUrl.trim(),
      }));
      setTab("manual");
      toast.success("Extracted — review the details before saving.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required.");
      setTab("manual");
      return;
    }
    setPending(true);
    try {
      const created = await createApplication({
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
      onCreated(created);
      toast.success("Application added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Couldn't add that application. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Plus className="size-4" />
        Add job
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an application</DialogTitle>
          <DialogDescription>
            Paste a job link to auto-fill the details, or enter them manually.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Tabs value={tab} onValueChange={(v) => v && setTab(v)}>
            <TabsList className="w-full">
              <TabsTrigger value="link" className="flex-1">
                Paste a link
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex-1">
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="linkUrl">Job posting URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="linkUrl"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={extracting}
                    onClick={handleExtract}
                    className="shrink-0 gap-1.5"
                  >
                    {extracting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {extracting ? "Extracting..." : "Extract"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll fetch the page and pull out the company, role,
                  location, and more. You can review and edit everything
                  before saving.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="flex flex-col gap-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
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
                  <Label htmlFor="datePosted">Date Posted</Label>
                  <Input
                    id="datePosted"
                    type="date"
                    value={form.datePosted}
                    onChange={(e) => update("datePosted", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dateApplied">Date Applied</Label>
                  <Input
                    id="dateApplied"
                    type="date"
                    value={form.dateApplied}
                    onChange={(e) => update("dateApplied", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="e.g. Remote, NYC"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    value={form.salary}
                    onChange={(e) => update("salary", e.target.value)}
                    placeholder="e.g. $120k-$140k"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="jobUrl">Job Link</Label>
                <Input
                  id="jobUrl"
                  type="url"
                  value={form.jobUrl}
                  onChange={(e) => update("jobUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
