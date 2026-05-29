"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { ConfirmDisableStationModal } from "@/components/admin/ConfirmDisableStationModal";
import {
  emptyStationForm,
  parseStationForm,
  StationFormModal,
  stationToForm,
  type StationFormValues,
} from "@/components/admin/StationFormModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminStationToggle } from "@/hooks/useAdminStationToggle";
import { formatAdminStationError } from "@/lib/api-error";
import { createStation, deleteStation, updateStation } from "@/lib/admin-station-api";
import { clientApi } from "@/lib/client-api";
import { canDisableStation } from "@/lib/station-usage";
import { formatUsd } from "@/lib/utils";
import type { Station, StationStateEvent } from "@/lib/types";

type StationRow = Station & Partial<StationStateEvent>;

type FormMode = "create" | "edit";

export default function AdminStationsPage() {
  const [stations, setStations] = useState<StationRow[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StationFormValues>(emptyStationForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    loading: toggleLoading,
    error: toggleError,
    confirmDisable,
    requestToggle,
    confirmDisableAction,
    cancelDisable,
    clearMessages: clearToggleMessages,
  } = useAdminStationToggle();

  async function load() {
    const list = await clientApi<Station[]>("/admin/stations");
    const withState = await Promise.all(
      list.map(async (s) => {
        try {
          const state = await clientApi<StationStateEvent>(`/stations/${s.id}/state`);
          return { ...s, ...state, id: s.id };
        } catch {
          return s;
        }
      }),
    );
    setStations(withState);
  }

  useEffect(() => {
    void load().catch(console.error);
  }, []);

  function updateForm(field: keyof StationFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateModal() {
    setFormMode("create");
    setEditingId(null);
    setForm(emptyStationForm);
    setFormOpen(true);
  }

  function openEditModal(station: StationRow) {
    setFormMode("edit");
    setEditingId(station.id);
    setForm(stationToForm(station));
    setFormOpen(true);
  }

  function closeFormModal() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyStationForm);
  }

  async function submitForm() {
    setSaving(true);
    setActionError(null);

    try {
      const payload = parseStationForm(form);

      if (formMode === "create") {
        await createStation(payload);
        setActionSuccess("Estación creada correctamente");
      } else if (editingId) {
        await updateStation(editingId, payload);
        setActionSuccess("Estación actualizada correctamente");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyStationForm);
      await load();
    } catch (err) {
      setActionError(formatAdminStationError(err));
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(station: StationRow, enabled: boolean) {
    setActionError(null);
    setActionSuccess(null);
    requestToggle(station, enabled, () => {
      setActionSuccess(
        enabled
          ? `${station.name} habilitada`
          : `${station.name} deshabilitada`,
      );
      void load();
    });
  }

  async function remove(station: StationRow) {
    const { allowed, activeCount } = canDisableStation(station);
    if (!allowed) {
      setActionError(
        `No se puede eliminar: hay ${activeCount} sesión(es) o conector(es) en uso.`,
      );
      return;
    }

    if (!confirm(`¿Eliminar permanentemente "${station.name}"?`)) return;

    setDeletingId(station.id);
    setActionError(null);
    try {
      await deleteStation(station.id);
      setActionSuccess(`${station.name} eliminada`);
      await load();
    } catch (err) {
      setActionError(formatAdminStationError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="tesla-subheading mb-1">Catálogo</p>
          <h1 className="tesla-heading">Estaciones</h1>
        </div>
        <Button
          color="danger"
          startContent={<Plus className="h-4 w-4" />}
          onPress={openCreateModal}
        >
          Nueva estación
        </Button>
      </div>

      {toggleError && (
        <AdminAlert
          type="error"
          message={toggleError}
          onDismiss={clearToggleMessages}
        />
      )}
      {actionError && (
        <AdminAlert type="error" message={actionError} onDismiss={() => setActionError(null)} />
      )}
      {actionSuccess && (
        <AdminAlert
          type="success"
          message={actionSuccess}
          onDismiss={() => setActionSuccess(null)}
        />
      )}

      <Table
        aria-label="Estaciones"
        classNames={{ wrapper: "bg-neutral-900/50 border border-white/5" }}
      >
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>PRECIO</TableColumn>
          <TableColumn>CONECTORES</TableColumn>
          <TableColumn>HABILITADA</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {stations.map((s) => {
            const inUse = !canDisableStation(s).allowed;
            return (
              <TableRow key={s.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.address}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge state={s.state ?? (s.enabled ? "AVAILABLE" : "DISABLED")} />
                </TableCell>
                <TableCell>{formatUsd(s.pricePerKwh)}/kWh</TableCell>
                <TableCell>
                  {s.freeConnectors ?? "—"}/{s.connectorsTotal}
                  {inUse && s.enabled && (
                    <p className="text-xs text-yellow-500">En uso</p>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip
                    content={
                      inUse && s.enabled
                        ? "Hay cargas activas — no se puede deshabilitar"
                        : s.enabled
                          ? "Deshabilitar estación"
                          : "Habilitar estación"
                    }
                  >
                    <div>
                      <Switch
                        isSelected={s.enabled}
                        isDisabled={toggleLoading}
                        onValueChange={(v) => handleToggle(s, v)}
                        color="danger"
                        size="sm"
                      />
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip content="Editar estación">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => openEditModal(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={
                        inUse
                          ? "No se puede eliminar con cargas activas"
                          : "Eliminar estación"
                      }
                    >
                      <span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          isDisabled={inUse || deletingId === s.id}
                          isLoading={deletingId === s.id}
                          onPress={() => remove(s)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ConfirmDisableStationModal
        isOpen={Boolean(confirmDisable)}
        stationName={confirmDisable?.station.name ?? ""}
        loading={toggleLoading}
        onConfirm={confirmDisableAction}
        onCancel={cancelDisable}
      />

      <StationFormModal
        isOpen={formOpen}
        mode={formMode}
        form={form}
        saving={saving}
        onClose={closeFormModal}
        onChange={updateForm}
        onSubmit={() => void submitForm()}
      />
    </div>
  );
}
