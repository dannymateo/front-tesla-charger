import { InvoiceList } from "@/components/billing/InvoiceList";
import { getSession } from "@/lib/auth";
import { backendFetchSafe } from "@/lib/api";
import type { Invoice } from "@/lib/types";

export default async function DriverBillingPage({
  searchParams,
}: {
  searchParams?: { refresh?: string };
}) {
  const session = await getSession();
  let invoices: Invoice[] = [];
  let loadError: string | null = null;

  if (session) {
    const result = await backendFetchSafe<Invoice[]>("/me/invoices", {
      token: session.token,
    });
    invoices = result.data ?? [];
    loadError = result.error?.message ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-5 sm:space-y-6 sm:p-6">
      <div>
        <p className="tesla-subheading mb-1">Facturación</p>
        <h1 className="tesla-heading">Historial de cargas</h1>
        <p className="mt-2 text-sm text-neutral-500 sm:text-base">
          Selecciona facturas pendientes o vencidas y paga con PayPal en una sola transacción.
        </p>
      </div>
      <InvoiceList
        initialInvoices={invoices}
        initialError={loadError}
        refreshOnMount={searchParams?.refresh === "1"}
      />
    </div>
  );
}
