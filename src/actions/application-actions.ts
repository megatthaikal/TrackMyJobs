"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus, WorkType } from "@/generated/prisma/enums";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

const dateOrNull = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

const applicationInputSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  role: z.string().trim().min(1, "Role is required"),
  status: z.enum(ApplicationStatus).optional(),
  datePosted: dateOrNull.optional(),
  dateApplied: dateOrNull.optional(),
  location: z.string().trim().optional().nullable(),
  workType: z.enum(WorkType).optional().nullable(),
  jobUrl: z.string().trim().optional().nullable(),
  salary: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type ApplicationInput = z.input<typeof applicationInputSchema>;

export async function listApplications() {
  const userId = await requireUserId();
  return prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createApplication(input: Partial<ApplicationInput>) {
  const userId = await requireUserId();
  const parsed = applicationInputSchema.parse(input);

  const created = await prisma.application.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return created;
}

export async function updateApplication(
  id: string,
  patch: Partial<ApplicationInput>
) {
  const userId = await requireUserId();

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Application not found");
  }

  const parsed = applicationInputSchema.partial().parse(patch);

  const updated = await prisma.application.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteApplication(id: string) {
  const userId = await requireUserId();

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Application not found");
  }

  await prisma.application.delete({ where: { id } });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
}
