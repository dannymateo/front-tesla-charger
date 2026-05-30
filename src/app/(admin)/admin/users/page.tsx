"use client";

import { useEffect, useState } from "react";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { clientApi } from "@/lib/client-api";
import type { PublicUser } from "@/lib/types";
import { formatDate, formatKwh } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);

  useEffect(() => {
    clientApi<PublicUser[]>("/admin/users/overdue").then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="tesla-subheading mb-1">Finanzas</p>
        <h1 className="tesla-heading">Usuarios con deuda vencida</h1>
        <p className="mt-2 text-neutral-500">
          Conductores bloqueados por facturas vencidas de más de 30 días.
        </p>
      </div>

      <GlassCard className="flex items-start gap-3 border-yellow-500/20 bg-yellow-500/5">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <p className="text-sm text-neutral-400">
          Estos usuarios no pueden iniciar nuevas sesiones de carga hasta regularizar su deuda vía PayPal.
        </p>
      </GlassCard>

      <Table
        aria-label="Usuarios bloqueados"
        classNames={{ wrapper: "bg-neutral-900/50 border border-white/5" }}
      >
        <TableHeader>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>VEHÍCULO</TableColumn>
          <TableColumn>BATERÍA</TableColumn>
          <TableColumn>REGISTRO</TableColumn>
          <TableColumn>ESTADO</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay usuarios bloqueados">
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.vehicleModel}</TableCell>
              <TableCell>{formatKwh(user.batteryKwh)}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <Chip color="danger" size="sm" variant="flat">
                  Bloqueado
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
