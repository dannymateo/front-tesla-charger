export type UserRole = "USER" | "ADMIN";

export type PublicUser = {
  id: string;
  email: string;
  role: UserRole;
  vehicleModel: string;
  batteryKwh: number;
  isBlocked: boolean;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: PublicUser;
};

export type StationOperationalState =
  | "AVAILABLE"
  | "DISABLED"
  | "NO_CONNECTORS"
  | "SATURATED";

export type Station = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  connectorsTotal: number;
  maxKwThreshold: number;
  pricePerKwh: number;
  enabled: boolean;
};

export type StationState = {
  stationId: string;
  state: StationOperationalState;
  enabled: boolean;
  activeKw: number;
  busyConnectors: number;
  freeConnectors: number;
  connectorsTotal: number;
  maxKwThreshold: number;
  pricePerKwh: number;
};

export type StationWithState = Station & Partial<StationState> & {
  state?: StationOperationalState;
  activeKw?: number;
  busyConnectors?: number;
  freeConnectors?: number;
};

export type AdminMapStation = StationWithState & {
  activeSessions: ActiveSessionSummary[];
  revenueToday: {
    total: number;
    paidInvoicesCount: number;
  };
};

export type AdminMapResponse = {
  date: string;
  stations: AdminMapStation[];
};

export type SessionStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "STOPPED"
  | "REJECTED";

export type SessionView = {
  id: string;
  userId: string;
  stationId: string;
  requestedKwh: number;
  deliveredKwh: number;
  pricePerKwh: number;
  status: SessionStatus;
  rejectionReason: string | null;
  startedAt: string | null;
  endedAt: string | null;
  lastProgressAt: string | null;
  accumulatedCost: number;
  percentComplete: number;
};

export type StartSessionResponse = {
  sessionId: string;
  status: SessionStatus;
  stationId: string;
  requestedKwh: number;
  estimatedDurationSec: number;
  estimatedTotalCost: number;
  percentComplete: number;
  deliveredKwh: number;
  accumulatedCost: number;
};

export type SessionProgressEvent = {
  sessionId: string;
  stationId: string;
  userId: string;
  percentComplete: number;
  deliveredKwh: number;
  remainingSec: number;
  accumulatedCost: number;
  pricePerKwh: number;
};

export type StationStateEvent = StationState & {
  stationId: string;
  deleted?: boolean;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  activeSessions?: ActiveSessionSummary[];
  revenueToday?: {
    total: number;
    paidInvoicesCount: number;
  };
};

export type ActiveSessionSummary = {
  id: string;
  userId: string;
  stationId: string;
  requestedKwh: number;
  deliveredKwh: number;
  percentComplete: number;
  accumulatedCost: number;
  status: string;
};

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE";

export type Invoice = {
  id: string;
  userId: string;
  sessionId: string;
  kwh: number;
  unitPrice: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt: string | null;
};

export type PayPalCheckoutResponse = {
  paymentId: string;
  paypalOrderId: string;
  approvalUrl: string;
  amount: number;
  currency: string;
  invoiceIds: string[];
};

export type RevenueToday = {
  date: string;
  total: number;
  paidInvoicesCount: number;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
};

export type ApiError = {
  message?: string;
  code?: string;
  statusCode?: number;
};
