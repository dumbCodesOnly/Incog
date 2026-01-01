import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./cookies";
import type { Request } from "express";

describe("getSessionCookieOptions", () => {
  it("should return secure: true for https requests", () => {
    const req = { protocol: "https" } as Request;
    const options = getSessionCookieOptions(req);
    expect(options.secure).toBe(true);
  });

  it("should return secure: false for http requests", () => {
    const req = { protocol: "http", headers: {} } as Request;
    const options = getSessionCookieOptions(req);
    expect(options.secure).toBe(false);
  });

  it('should return secure: true when x-forwarded-proto is "https"', () => {
    const req = {
      protocol: "http",
      headers: { "x-forwarded-proto": "https" },
    } as Request;
    const options = getSessionCookieOptions(req);
    expect(options.secure).toBe(true);
  });

  it('should return secure: true when x-forwarded-proto has multiple values including "https"', () => {
    const req = {
      protocol: "http",
      headers: { "x-forwarded-proto": "http,https" },
    } as Request;
    const options = getSessionCookieOptions(req);
    expect(options.secure).toBe(true);
  });

  it("should return the correct default options", () => {
    const req = { protocol: "http", headers: {} } as Request;
    const options = getSessionCookieOptions(req);
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe("/");
    expect(options.sameSite).toBe("none");
  });
});
