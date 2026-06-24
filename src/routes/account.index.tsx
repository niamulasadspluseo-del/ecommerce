import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Download, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/account/")({ component: Dashboard });

function Dashboard() {
  const userId = useStore((s) => s.sessionUserId)!;
  const orders = useStore((s) => s.orders.filter((o) => o.userId === userId));
  const delivered = orders.filter((o) => o.status === "Delivered");
  const downloads = delivered.flatMap((o) => o.items);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5"><ShoppingBag className="h-5 w-5 text-muted-foreground" /><div className="mt-2 text-2xl font-bold">{orders.length}</div><div className="text-sm text-muted-foreground">Total orders</div></Card>
        <Card className="p-5"><Download className="h-5 w-5 text-muted-foreground" /><div className="mt-2 text-2xl font-bold">{downloads.length}</div><div className="text-sm text-muted-foreground">Available downloads</div></Card>
        <Card className="p-5"><Clock className="h-5 w-5 text-muted-foreground" /><div className="mt-2 text-2xl font-bold">{orders.filter((o) => o.status !== "Delivered" && o.status !== "Refunded").length}</div><div className="text-sm text-muted-foreground">In progress</div></Card>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">My Purchases</h2>
        {downloads.length ? (
          <div className="space-y-2">
            {downloads.map((d, i) => (
              <Card key={i} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.title}</div>
                  {d.variationName && <div className="text-xs text-muted-foreground">{d.variationName}</div>}
                </div>
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Button size="sm"><Download className="h-4 w-4 mr-1" />Download</Button></a>
              </Card>
            ))}
          </div>
        ) : <Card className="p-6 text-center text-sm text-muted-foreground">No downloads yet. Purchases unlock once order status is Delivered.</Card>}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Recent orders</h2>
        {orders.slice(0, 5).length ? (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <Link key={o.id} to="/account/orders/$id" params={{ id: o.id }}>
                <Card className="p-4 flex justify-between items-center hover:shadow-sm">
                  <div>
                    <div className="font-medium">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()} · {o.items.length} items</div>
                  </div>
                  <div className="flex items-center gap-3"><Badge variant="outline">{o.status}</Badge><span className="font-semibold">${o.total.toFixed(2)}</span></div>
                </Card>
              </Link>
            ))}
          </div>
        ) : <Card className="p-6 text-center text-sm text-muted-foreground">No orders yet.</Card>}
      </div>
    </div>
  );
}
