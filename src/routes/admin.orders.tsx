import { createFileRoute } from "@tanstack/react-router";
import { useStore, orders as ordersApi, type OrderStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const STATUSES: OrderStatus[] = ["Pending", "In Progress", "Ready For Delivery", "Delivered", "Refunded"];

function OrdersAdmin() {
  const orders = useStore((s) => s.orders);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <div className="space-y-2">
        {orders.map((o) => (
          <Card key={o.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{o.id}</div>
              <div className="text-xs text-muted-foreground">{o.userName} · {o.userEmail} · {new Date(o.createdAt).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{o.items.length} items · {o.payment.method}{o.payment.network ? " · " + o.payment.network : ""}</div>
            </div>
            <div className="font-semibold">${o.total.toFixed(2)}</div>
            <Select value={o.status} onValueChange={(v: OrderStatus) => ordersApi.setStatus(o.id, v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Card>
        ))}
        {!orders.length && <p className="text-sm text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
}
