import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { notifyOwner, NotificationPayload } from "./notification";
import { ENV } from "./env";
import { TRPCError } from "@trpc/server";

// Mock the global fetch
global.fetch = vi.fn();

describe("notifyOwner", () => {
  const validPayload: NotificationPayload = {
    title: "Test Title",
    content: "Test Content",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    ENV.forgeApiUrl = "https://example.com";
    ENV.forgeApiKey = "test-key";
  });

  it("should send a notification successfully", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => "",
    } as Response);

    const result = await notifyOwner(validPayload);

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/webdevtoken.v1.WebDevService/SendNotification",
      expect.any(Object)
    );
  });

  it("should return false if the notification service is unavailable", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await notifyOwner(validPayload);

    expect(result).toBe(false);
  });

  it("should return false if the notification service returns a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Error detail",
    } as Response);

    const result = await notifyOwner(validPayload);

    expect(result).toBe(false);
  });

  it("should throw an error if the title is empty", async () => {
    const payload: NotificationPayload = { title: "", content: "Test Content" };
    await expect(notifyOwner(payload)).rejects.toThrowError(
      "Notification title is required."
    );
  });

  it("should throw an error if the content is empty", async () => {
    const payload: NotificationPayload = { title: "Test Title", content: "" };
    await expect(notifyOwner(payload)).rejects.toThrowError(
      "Notification content is required."
    );
  });

  it("should throw an error if the forgeApiUrl is not configured", async () => {
    ENV.forgeApiUrl = "";
    await expect(notifyOwner(validPayload)).rejects.toThrowError(
      "Notification service URL is not configured."
    );
  });

  it("should throw an error if the forgeApiKey is not configured", async () => {
    ENV.forgeApiKey = "";
    await expect(notifyOwner(validPayload)).rejects.toThrowError(
      "Notification service API key is not configured."
    );
  });
});
