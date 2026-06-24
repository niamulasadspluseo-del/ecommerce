import { createFileRoute } from "@tanstack/react-router";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/customers")({ component: CustomersAdmin });

function CustomersAdmin() {
  const users = useStore((s) => s.users.filter((u) => u.role === "customer"));
  const orders = useStore((s) => s.orders);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      <div className="space-y-2">
        {users.map((u) => {
          const myOrders = orders.filter((o) => o.userId === u.id);
          const spent = myOrders.reduce((s, o) => s + o.total, 0);
          return (
            <Card key={u.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email} · joined {new Date(u.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">{myOrders.length} orders · ${spent.toFixed(2)} spent</div>
              </div>
              <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
              <Button size="sm" variant="outline" onClick={() => admin.setUserStatus(u.id, u.status === "suspended" ? "active" : "suspended")}>
                {u.status === "suspended" ? "Unsuspend" : "Suspend"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => admin.setUserStatus(u.id, u.status === "banned" ? "active" : "banned")}>
                {u.status === "banned" ? "Unban" : "Ban"}
              </Button>
            </Card>
          );
        })}
        {!users.length && <p className="text-sm text-muted-foreground">No customers yet.</p>}
      </div>
    </div>
  );
}
