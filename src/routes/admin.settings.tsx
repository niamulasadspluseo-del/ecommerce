import { createFileRoute } from "@tanstack/react-router";
import { resetStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

function SettingsAdmin() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">General Settings</h1>
      <Card className="p-6">
        <h2 className="font-semibold">Storage</h2>
        <p className="text-sm text-muted-foreground mt-1">All data is currently stored in your browser localStorage. Connect a backend to persist across devices.</p>
        <Button variant="destructive" className="mt-4" onClick={() => { if (confirm("Reset all data to seed?")) { resetStore(); toast.success("Reset complete"); } }}>Reset demo data</Button>
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold">SEO</h2>
        <p className="text-sm text-muted-foreground mt-1">Edit your meta title / description in <strong>Branding</strong>. Sitemap & robots.txt come with your backend.</p>
      </Card>
    </div>
  );
}
