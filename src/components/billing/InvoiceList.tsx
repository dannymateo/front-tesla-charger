"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { clientApi } from "@/lib/client-api";
import { getErrorMessage } from "@/lib/api-error";
import { ServiceUnavailableBanner } from "@/components/ui/ServiceUnavailableBanner";
import { cn, formatDate, formatKwh, formatUsd } from "@/lib/utils";

const statusColors: Record<InvoiceStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "danger",
};

const FILTER_OPTIONS = [
  { key: "all", label: "Todas" },
  { key: "PENDING", label: "Pendientes" },
  { key: "OVERDUE", label: "Vencidas" },
  { key: "PAID", label: "Pagadas" },
] as const;

type InvoiceListProps = {
  initialInvoices: Invoice[];
  initialError?: string | null;
  refreshOnMount?: boolean;
};

export function InvoiceList({
  initialInvoices,
  initialError = null,
  refreshOnMount = false,
}: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");
  const [paying, setPaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const filtered = invoices.filter((inv) =>
    filter === "all" ? true : inv.status === filter,
  );

  const payable = filtered.filter(
    (inv) => inv.status === "PENDING" || inv.status === "OVERDUE",
  );

  async function loadInvoices() {
    setRefreshing(true);
    setError(null);
    try {
      const data = await clientApi<Invoice[]>("/me/invoices");
      setInvoices(data);
      setSelected(new Set());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!refreshOnMount) return;
    void (async () => {
      await loadInvoices();
      router.replace("/driver/billing", { scroll: false });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(next: string) {
    setFilter(next);
  }

  async function paySelected() {
    if (selected.size === 0) return;
    setPaying(true);
    setError(null);
    try {
      const result = await clientApi<{ approvalUrl: string }>(
        "/payments/paypal/create",
        {
          method: "POST",
          body: { invoiceIds: Array.from(selected) },
        },
      );
      window.location.href = result.approvalUrl;
    } catch (e) {
      setError(getErrorMessage(e));
      setPaying(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col items-stretch gap-3 sm:items-center md:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        <div
          className={cn(
            "inline-flex max-w-full flex-row gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/60 p-1",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "sm:mx-auto sm:w-auto",
          )}
          role="tablist"
          aria-label="Filtrar facturas por estado"
        >
          {FILTER_OPTIONS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleFilter(key)}
                className={cn(
                  "shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                  active
                    ? "bg-tesla-red/15 text-tesla-red ring-1 ring-tesla-red/30"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <Button
          variant="flat"
          size="sm"
          isLoading={refreshing}
          onPress={() => void loadInvoices()}
          startContent={
            !refreshing ? <RefreshCw className="h-4 w-4" aria-hidden /> : undefined
          }
          className="w-full shrink-0 border border-white/10 bg-neutral-900/60 text-neutral-300 sm:w-auto"
          aria-label="Recargar facturas"
        >
          Recargar
        </Button>
        </div>

        {payable.length > 0 && (
          <Button
            color="danger"
            size="sm"
            isLoading={paying}
            isDisabled={selected.size === 0}
            onPress={paySelected}
            className="w-full max-w-xs font-semibold sm:w-auto sm:min-w-[180px]"
          >
            Pagar con PayPal ({selected.size})
          </Button>
        )}
      </div>

      {error && (
        <ServiceUnavailableBanner
          message={error}
          onRetry={() => void loadInvoices()}
          retrying={refreshing}
        />
      )}

      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-white/5 bg-neutral-900/50 px-4 py-8 text-center text-sm text-neutral-500">
            No hay facturas
          </p>
        ) : (
          filtered.map((invoice) => {
            const canSelect =
              invoice.status === "PENDING" || invoice.status === "OVERDUE";
            const isSelected = selected.has(invoice.id);

            return (
              <button
                key={invoice.id}
                type="button"
                disabled={!canSelect}
                onClick={() => {
                  if (!canSelect) return;
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(invoice.id)) next.delete(invoice.id);
                    else next.add(invoice.id);
                    return next;
                  });
                }}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  canSelect && "active:scale-[0.99]",
                  isSelected
                    ? "border-tesla-red/40 bg-tesla-red/10"
                    : "border-white/5 bg-neutral-900/50",
                  !canSelect && "cursor-default opacity-90",
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    {formatDate(invoice.issuedAt)}
                  </p>
                  <Chip
                    size="sm"
                    color={statusColors[invoice.status]}
                    variant="flat"
                    classNames={{ content: "text-[10px] sm:text-xs" }}
                  >
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </Chip>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 sm:text-sm">
                  <span>{formatKwh(invoice.kwh)}</span>
                  <span className="font-semibold text-white">
                    {formatUsd(invoice.total)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <Table
        aria-label="Facturas"
        classNames={{
          wrapper: "hidden bg-neutral-900/50 border border-white/5 md:block",
          th: "bg-neutral-900 text-xs text-neutral-400 sm:text-sm",
          td: "text-xs sm:text-sm",
        }}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={(keys) => {
          if (keys === "all") {
            setSelected(new Set(payable.map((i) => i.id)));
          } else {
            setSelected(new Set(Array.from(keys as Set<string>)));
          }
        }}
      >
        <TableHeader>
          <TableColumn>FECHA</TableColumn>
          <TableColumn>kWh</TableColumn>
          <TableColumn>TOTAL</TableColumn>
          <TableColumn>ESTADO</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay facturas">
          {filtered.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
              <TableCell>{formatKwh(invoice.kwh)}</TableCell>
              <TableCell>{formatUsd(invoice.total)}</TableCell>
              <TableCell>
                <Chip size="sm" color={statusColors[invoice.status]} variant="flat">
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
