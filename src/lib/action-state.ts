export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  ts?: number;
} | null;

export const success = (message: string): ActionState => ({ ok: true, message, ts: Date.now() });
export const failure = (message: string, errors?: Record<string, string>): ActionState => ({ ok: false, message, errors, ts: Date.now() });
