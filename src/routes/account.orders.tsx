import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/account/orders")({ component: Orders });

function Orders() {
  const userId = useStore((s) => s.sessionUserId)!;
  const orders = useStore((s) => s.orders.filter((o) => o.userId === userId));
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="space-y-2">
        {orders.map((o) => (
          <Link key={o.id} to="/account/orders/$id" params={{ id: o.id }}>
            <Card className="p-4 flex justify-between items-center hover:shadow-sm">
              <div>
                <div className="font-medium">{o.id}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3"><Badge variant="outline">{o.status}</Badge><span className="font-semibold">${o.total.toFixed(2)}</span></div>
            </Card>
          </Link>
        ))}
        {!orders.length && <Card className="p-6 text-center text-sm text-muted-foreground">No orders yet.</Card>}
      </div>
    </div>
  );
}
