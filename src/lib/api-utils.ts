import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse<{ error: string; message?: string; code?: string }> {
  return NextResponse.json(
    { error: code ?? "ERROR", message },
    { status }
  );
}

export function apiValidationError(err: ZodError): NextResponse {
  return NextResponse.json(
    { error: "VALIDATION_ERROR", details: err.flatten() },
    { status: 400 }
  );
}
