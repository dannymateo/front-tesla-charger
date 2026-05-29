"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { MapPin } from "lucide-react";
import { LocationPickerMapClient } from "@/components/map/LocationPickerMapClient";
import { MEDELLIN_CENTER } from "@/lib/constants";
import type { Station } from "@/lib/types";

export type StationFormValues = {
  name: string;
  address: string;
  lat: string;
  lng: string;
  connectorsTotal: string;
  maxKwThreshold: string;
  pricePerKwh: string;
};

export const emptyStationForm: StationFormValues = {
  name: "",
  address: "",
  lat: String(MEDELLIN_CENTER.lat),
  lng: String(MEDELLIN_CENTER.lng),
  connectorsTotal: "4",
  maxKwThreshold: "100",
  pricePerKwh: "0.40",
};

export function stationToForm(station: Station): StationFormValues {
  return {
    name: station.name,
    address: station.address,
    lat: String(station.lat),
    lng: String(station.lng),
    connectorsTotal: String(station.connectorsTotal),
    maxKwThreshold: String(station.maxKwThreshold),
    pricePerKwh: String(station.pricePerKwh),
  };
}

export function parseStationForm(form: StationFormValues) {
  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (!form.name.trim() || !form.address.trim()) {
    throw new Error("Nombre y dirección son obligatorios");
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Selecciona una ubicación válida en el mapa");
  }

  return {
    name: form.name.trim(),
    address: form.address.trim(),
    lat,
    lng,
    connectorsTotal: Number(form.connectorsTotal),
    maxKwThreshold: Number(form.maxKwThreshold),
    pricePerKwh: Number(form.pricePerKwh),
  };
}

type StationFormModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  form: StationFormValues;
  saving?: boolean;
  onClose: () => void;
  onChange: (field: keyof StationFormValues, value: string) => void;
  onSubmit: () => void;
};

export function StationFormModal({
  isOpen,
  mode,
  form,
  saving,
  onClose,
  onChange,
  onSubmit,
}: StationFormModalProps) {
  const lat = Number(form.lat);
  const lng = Number(form.lng);
  const mapLat = Number.isFinite(lat) ? lat : MEDELLIN_CENTER.lat;
  const mapLng = Number.isFinite(lng) ? lng : MEDELLIN_CENTER.lng;

  function handleMapChange(nextLat: number, nextLng: number) {
    onChange("lat", nextLat.toFixed(6));
    onChange("lng", nextLng.toFixed(6));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        wrapper: "z-[10000]",
        backdrop: "z-[10000]",
        base: "z-[10001] border border-white/10 bg-neutral-900",
      }}
    >
      <ModalContent>
        <ModalHeader>
          {mode === "create" ? "Nueva estación" : "Editar estación"}
        </ModalHeader>
        <ModalBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre"
            value={form.name}
            onValueChange={(value) => onChange("name", value)}
            variant="bordered"
            className="sm:col-span-2"
            isRequired
          />
          <Input
            label="Dirección"
            value={form.address}
            onValueChange={(value) => onChange("address", value)}
            variant="bordered"
            className="sm:col-span-2"
            isRequired
          />

          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center gap-2 text-sm text-neutral-400">
              <MapPin className="h-4 w-4 text-tesla-red" />
              Ubicación — haz clic en el mapa o arrastra el marcador
            </div>
            <LocationPickerMapClient
              lat={mapLat}
              lng={mapLng}
              onChange={handleMapChange}
            />
          </div>

          <Input
            label="Latitud"
            value={form.lat}
            onValueChange={(value) => onChange("lat", value)}
            variant="bordered"
            type="number"
            step="0.000001"
          />
          <Input
            label="Longitud"
            value={form.lng}
            onValueChange={(value) => onChange("lng", value)}
            variant="bordered"
            type="number"
            step="0.000001"
          />

          <Input
            label="Conectores"
            value={form.connectorsTotal}
            onValueChange={(value) => onChange("connectorsTotal", value)}
            variant="bordered"
            type="number"
            min="1"
          />
          <Input
            label="Umbral kW"
            value={form.maxKwThreshold}
            onValueChange={(value) => onChange("maxKwThreshold", value)}
            variant="bordered"
            type="number"
            min="1"
          />
          <Input
            label="Precio USD/kWh"
            value={form.pricePerKwh}
            onValueChange={(value) => onChange("pricePerKwh", value)}
            variant="bordered"
            type="number"
            step="0.01"
            min="0"
            className="sm:col-span-2"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={saving}>
            Cancelar
          </Button>
          <Button color="danger" isLoading={saving} onPress={onSubmit}>
            {mode === "create" ? "Crear" : "Guardar cambios"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
