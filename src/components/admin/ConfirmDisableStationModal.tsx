"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { AlertTriangle } from "lucide-react";

type ConfirmDisableStationModalProps = {
  isOpen: boolean;
  stationName: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDisableStationModal({
  isOpen,
  stationName,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDisableStationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onCancel();
      }}
      placement="center"
      classNames={{
        wrapper: "z-[10000]",
        backdrop: "z-[10000]",
        base: "z-[10001] bg-neutral-900/95 border border-white/10",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Deshabilitar estación
            </ModalHeader>
            <ModalBody>
              <p className="text-neutral-300">
                ¿Deseas deshabilitar <strong className="text-white">{stationName}</strong>?
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Los conductores dejarán de verla en el mapa y no podrán iniciar nuevas cargas.
                Las sesiones en curso no se verán afectadas.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" isDisabled={loading} onPress={onCancel}>
                Cancelar
              </Button>
              <Button color="danger" isLoading={loading} onPress={onConfirm}>
                Deshabilitar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
