import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logout } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AppNav } from "@/components/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/applications">
              <Logo />
            </Link>
            <AppNav />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
            <ThemeToggle />
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
