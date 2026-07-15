import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-primary/25 blur-3xl animate-blob-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-teal-400/20 blur-3xl animate-blob-float [animation-delay:2.5s]"
      />
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        <Logo className="text-lg" iconClassName="size-9 rounded-xl" />
        {children}
      </div>
    </div>
  );
}
