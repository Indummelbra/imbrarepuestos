export interface PTPStatus {
  status: 'OK' | 'FAILED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'APPROVED_PARTIAL' | 'PARTIAL';
  reason: string;
  message: string;
  date: string;
}

export interface PTPAuth {
  login: string;
  tranKey: string;
  nonce: string;
  seed: string;
}

export interface PTPAmount {
  currency: string;
  total: number;
}

export interface PTPAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  postalCode?: string;
}

export interface PTPBuyer {
  document?: string;
  documentType?: string;
  name: string;
  surname: string;
  email: string;
  mobile?: string;
  address?: PTPAddress;
}

export interface PTPPayment {
  reference: string;
  description: string;
  amount: PTPAmount;
  allowPartial?: boolean;
}

export interface PTPCreateSessionRequest {
  locale?: string;
  auth: PTPAuth;
  payment: PTPPayment;
  buyer?: PTPBuyer;
  payer?: PTPBuyer;
  expiration: string;
  returnUrl: string;
  // URL a la que PlacetoPay envia notificaciones de confirmacion de pago (webhook)
  notificationUrl?: string;
  ipAddress: string;
  userAgent: string;
}

export interface PTPCreateSessionResponse {
  status: PTPStatus;
  requestId?: number;
  processUrl?: string;
}

export interface PTPQuerySessionResponse {
  requestId: number;
  status: PTPStatus;
  request: PTPCreateSessionRequest;
  payment: {
    status: PTPStatus;
    reference: string;
    description: string;
    amount: PTPAmount;
  }[];
}
