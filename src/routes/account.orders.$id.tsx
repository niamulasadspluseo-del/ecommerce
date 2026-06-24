import { createFileRoute, notFound } from "@tanstack/react-router";
import { useStore, type OrderStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

export const Route = createFileRoute("/account/orders/$id")({ component: OrderDetail });

const FLOW: OrderStatus[] = ["Pending", "In Progress", "Ready For Delivery", "Delivered"];

function OrderDetail() {
  const { id } = Route.useParams();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  if (!order) throw notFound();
  const stepIdx = FLOW.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order {order.id}</h1>
        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      {order.status !== "Refunded" && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Order status</h2>
          <div className="flex items-center justify-between gap-2">
            {FLOW.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center text-center">
                <div className={`h-8 w-8 rounded-full grid place-items-center ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < stepIdx ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <div className={`mt-2 text-xs ${i <= stepIdx ? "font-medium" : "text-muted-foreground"}`}>{s}</div>
                {i < FLOW.length - 1 && <div className="hidden sm:block absolute" />}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{it.title}</div>
                {it.variationName && <div className="text-xs text-muted-foreground">{it.variationName} · qty {it.qty}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span>${(it.price * it.qty).toFixed(2)}</span>
                {order.status === "Delivered" && (
                  <a href={it.fileUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Download</Button></a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>−${order.discount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      </Card>

      <Card className="p-6 text-sm">
        <h2 className="font-semibold mb-2">Payment</h2>
        <div>Method: <strong>{order.payment.method === "stripe" ? "Card" : "Crypto"}</strong></div>
        {order.payment.cardLast4 && <div>Card ending in •••• {order.payment.cardLast4}</div>}
        {order.payment.network && <div>Network: {order.payment.network}</div>}
        {order.payment.txid && <div className="break-all">TXID: <span className="font-mono text-xs">{order.payment.txid}</span></div>}
      </Card>
    </div>
  );
}
