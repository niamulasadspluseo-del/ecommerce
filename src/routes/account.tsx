import { createFileRoute, Outlet, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useEffect } from "react";

export const Route = createFileRoute("/account")({ component: AccountLayout });

function AccountLayout() {
  const session = useStore((s) => s.sessionUserId);
  const nav = useNavigate();
  useEffect(() => { if (!session) nav({ to: "/auth" }); }, [session, nav]);
  if (!session) return null;
  return (
    <SiteLayout>
      <div className="container mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <nav className="space-y-1 text-sm">
            <SideLink to="/account">Dashboard</SideLink>
            <SideLink to="/account/orders">My Orders</SideLink>
            <SideLink to="/account/settings">Account Settings</SideLink>
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </SiteLayout>
  );
}

function SideLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} activeOptions={{ exact: to === "/account" }} activeProps={{ className: "bg-accent text-accent-foreground" }} className="block rounded-md px-3 py-2 hover:bg-accent">{children}</Link>;
}
