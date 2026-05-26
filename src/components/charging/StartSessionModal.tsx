"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Slider,
} from "@nextui-org/react";
import { Zap } from "lucide-react";
import type { StationWithState } from "@/lib/types";
import { formatKwh, formatUsd } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlassCard } from "@/components/ui/GlassCard";

type StartSessionModalProps = {
  station: StationWithState | null;
  batteryKwh: number;
  isOpen: boolean;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (kwh: number) => void;
};

export function StartSessionModal({
  station,
  batteryKwh,
  isOpen,
  loading,
  error,
  onClose,
  onConfirm,
}: StartSessionModalProps) {
  const maxKwh = Math.max(
    1,
    Math.min(batteryKwh, Number(station?.maxKwThreshold ?? batteryKwh)),
  );
  const [kwh, setKwh] = useState(Math.min(20, maxKwh));

  useEffect(() => {
    if (isOpen) {
      setKwh(Math.min(20, maxKwh));
    }
  }, [isOpen, maxKwh]);

  const state = station?.state ?? "AVAILABLE";
  const canStart =
    Boolean(station) &&
    state === "AVAILABLE" &&
    station?.enabled !== false &&
    !loading;
  const price = Number(station?.pricePerKwh ?? 0);

  function handleConfirm() {
    if (!canStart || !station) return;
    onConfirm(kwh);
  }

  return (
    <Modal
      isOpen={isOpen && Boolean(station)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="center"
      backdrop="blur"
      isDismissable={!loading}
      hideCloseButton={loading}
      scrollBehavior="inside"
      classNames={{
        wrapper: "z-[10000] items-center",
        backdrop: "z-[10000]",
        base: "z-[10001] bg-neutral-900/95 border border-white/10 max-h-[90vh]",
        header: "border-b border-white/5",
        footer: "border-t border-white/5",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-lg font-semibold">{station?.name}</span>
              <span className="text-sm font-normal text-neutral-500">
                {station?.address}
              </span>
            </ModalHeader>
            <ModalBody>
              {station && (
                <>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <StatusBadge state={state} />
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-neutral-300">
                      {station.freeConnectors ?? "?"} conectores libres
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-neutral-300">
                      {formatUsd(price)}/kWh
                    </span>
                  </div>

                  <Slider
                    label="Energía a cargar"
                    step={1}
                    minValue={1}
                    maxValue={maxKwh}
                    value={kwh}
                    onChange={(v) => setKwh(Array.isArray(v) ? v[0] : v)}
                    className="mb-6"
                    color="danger"
                    isDisabled={loading}
                    getValue={(v) => formatKwh(Array.isArray(v) ? v[0] : v)}
                    renderValue={({ children }) => (
                      <span className="text-tesla-red">{children}</span>
                    )}
                  />

                  <GlassCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500">Costo estimado</p>
                        <p className="text-xl font-semibold text-white">
                          {formatUsd(kwh * price)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          ~{Math.ceil(kwh / 5)}s de simulación
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-tesla-red/60" />
                    </div>
                  </GlassCard>

                  {error && (
                    <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {error}
                    </p>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" isDisabled={loading} onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="danger"
                isLoading={loading}
                isDisabled={!canStart}
                className="font-semibold"
                onPress={handleConfirm}
              >
                {canStart ? "Confirmar carga" : "No disponible"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
