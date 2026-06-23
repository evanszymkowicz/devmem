import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/search", () => ({
  getSearchData: vi.fn(),
}));

import { getSearchData } from "./search";
import { getSearchData as dbGetSearchData } from "@/lib/db/search";
import { auth } from "@/auth";

const mockAuth = vi.mocked(auth);
const mockDbGet = vi.mocked(dbGetSearchData);

const AUTHED_SESSION = { user: { id: "user-1" } };

const MOCK_SEARCH_DATA = {
  items: [
    {
      id: "item-1",
      title: "My Snippet",
      preview: "console.log",
      typeName: "Snippet",
      typeIcon: "Code",
      typeColor: "#3b82f6",
    },
  ],
  collections: [{ id: "col-1", name: "React Patterns", itemCount: 3 }],
};

describe("getSearchData action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await getSearchData();
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbGet).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await getSearchData();
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbGet).not.toHaveBeenCalled();
  });

  it("returns success with the search data on happy path", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbGet.mockResolvedValue(MOCK_SEARCH_DATA);
    const result = await getSearchData();
    expect(result).toEqual({ success: true, data: MOCK_SEARCH_DATA });
  });

  it("scopes the DB query to the session user id", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbGet.mockResolvedValue(MOCK_SEARCH_DATA);
    await getSearchData();
    expect(mockDbGet).toHaveBeenCalledWith("user-1");
  });

  it("returns a generic error when the DB throws", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbGet.mockRejectedValue(new Error("connection lost"));
    const result = await getSearchData();
    expect(result).toEqual({ success: false, error: "Failed to load search data" });
  });
});
