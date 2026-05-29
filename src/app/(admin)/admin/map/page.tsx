"use client";

import { useCallback, useEffect, useState } from "react";
import { Chip } from "@nextui-org/react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { ConfirmDisableStationModal } from "@/components/admin/ConfirmDisableStationModal";
import {
  parseStationForm,
  StationFormModal,
  stationToForm,
  type StationFormValues,
} from "@/components/admin/StationFormModal";
import { StationMapClient } from "@/components/map/StationMapClient";
import { StationDetailPanel } from "@/components/map/StationDetailPanel";
import { useAdminStationToggle } from "@/hooks/useAdminStationToggle";
import { useMapSocket } from "@/hooks/useSocket";
import { formatAdminStationError, getErrorMessage } from "@/lib/api-error";
import { updateStation } from "@/lib/admin-station-api";
import { clientApi } from "@/lib/client-api";
import { applyAdminStationEvent, patchSelectedStation } from "@/lib/station-events";
import type { AdminMapResponse, AdminMapStation, StationStateEvent } from "@/lib/types";

export default function AdminMapPage() {
  const [data, setData] = useState<AdminMapResponse | null>(null);
  const [selected, setSelected] = useState<AdminMapStation | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<StationFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const {
    loading: toggleLoading,
    error: toggleError,
    success: toggleSuccess,
    confirmDisable,
    requestToggle,
    confirmDisableAction,
    cancelDisable,
    clearMessages,
  } = useAdminStationToggle();

  const mergeStationState = useCallback((payload: StationStateEvent) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stations: applyAdminStationEvent(prev.stations, payload),
      };
    });
    setSelected((prev) => patchSelectedStation(prev, payload));
    clearMessages();
  }, [clearMessages]);

  useMapSocket((payload) => mergeStationState(payload as StationStateEvent), true);

  useEffect(() => {
    void loadMap();
  }, []);

  async function loadMap() {
    setPageError(null);
    try {
      const response = await clientApi<AdminMapResponse>("/admin/map");
      setData(response);
    } catch (e) {
      setPageError(getErrorMessage(e));
    }
  }

  function handleToggle(enabled: boolean) {
    if (!selected) return;
    requestToggle(selected, enabled);
  }

  function openEditModal() {
    if (!selected) return;
    setEditForm(stationToForm(selected));
    setEditOpen(true);
  }

  function closeEditModal() {
    if (saving) return;
    setEditOpen(false);
    setEditForm(null);
  }

  async function submitEdit() {
    if (!selected || !editForm) return;
    setSaving(true);
    setPageError(null);

    try {
      const payload = parseStationForm(editForm);
      const updated = await updateStation(selected.id, payload);
      setPageSuccess(`${updated.name} actualizada`);
      setEditOpen(false);
      setEditForm(null);
      await loadMap();
      setSelected((prev) =>
        prev?.id === updated.id
          ? { ...prev, ...updated }
          : prev,
      );
    } catch (err) {
      setPageError(formatAdminStationError(err));
    } finally {
      setSaving(false);
    }
  }

  function dismissSelection() {
    clearMessages();
    setSelected(null);
  }

  const saturated = data?.stations.filter((s) => s.state === "SATURATED").length ?? 0;
  const disabled = data?.stations.filter((s) => !s.enabled).length ?? 0;

  return (
    <div className="relative h-full w-full max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-14 max-md:z-0">
      <div className="absolute inset-0 z-0">
        <StationMapClient
          stations={data?.stations ?? []}
          selectedId={selected?.id}
          onSelect={(station) => {
            clearMessages();
            setSelected(station as AdminMapStation);
          }}
          showDisabled
          tooltipPosition={
            selected ? { lat: selected.lat, lng: selected.lng } : null
          }
          onDismissTooltip={dismissSelection}
          tooltip={
            selected ? (
              <StationDetailPanel
                station={selected}
                isAdmin
                toggleLoading={toggleLoading}
                toggleError={toggleError}
                toggleSuccess={toggleSuccess}
                onClose={dismissSelection}
                onStartCharge={() => {}}
                onToggle={handleToggle}
                onEdit={openEditModal}
              />
            ) : null
          }
        />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-md flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Chip variant="flat" className="pointer-events-auto bg-black/70">
            {data?.stations.length ?? 0} estaciones
          </Chip>
          <Chip color="warning" variant="flat" className="pointer-events-auto">
            {saturated} saturadas
          </Chip>
          <Chip color="danger" variant="flat" className="pointer-events-auto">
            {disabled} deshabilitadas
          </Chip>
        </div>
        {pageError && (
          <AdminAlert
            type="error"
            message={pageError}
            onDismiss={() => setPageError(null)}
            className="pointer-events-auto"
          />
        )}
        {pageSuccess && (
          <AdminAlert
            type="success"
            message={pageSuccess}
            onDismiss={() => setPageSuccess(null)}
            className="pointer-events-auto"
          />
        )}
      </div>

      <ConfirmDisableStationModal
        isOpen={Boolean(confirmDisable)}
        stationName={confirmDisable?.station.name ?? ""}
        loading={toggleLoading}
        onConfirm={confirmDisableAction}
        onCancel={cancelDisable}
      />

      {editForm && (
        <StationFormModal
          isOpen={editOpen}
          mode="edit"
          form={editForm}
          saving={saving}
          onClose={closeEditModal}
          onChange={(field, value) =>
            setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev))
          }
          onSubmit={() => void submitEdit()}
        />
      )}
    </div>
  );
}
