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

export interface PTPBuyer {
  document?: string;
  documentType?: string;
  name: string;
  surname: string;
  email: string;
  mobile?: string;
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
  expiration: string;
  returnUrl: string;
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
