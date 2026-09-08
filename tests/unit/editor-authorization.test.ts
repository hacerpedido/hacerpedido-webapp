/** @jest-environment node */

const mockEditorAuthorizationPoolQuery = jest.fn();

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("#lib/db/pool", () => ({
  getPool: jest.fn(() => ({ query: mockEditorAuthorizationPoolQuery })),
}));

const { authorizeEditorRequest } =
  require("#lib/server/editor-authorization") as {
    authorizeEditorRequest: (request: Request) => Promise<string | null>;
  };

const authorizedShopID = "550e8400-e29b-41d4-a716-446655440000";

describe("editor image authorization", () => {
  beforeEach(() => mockEditorAuthorizationPoolQuery.mockReset());

  test.each([
    undefined,
    "Basic token",
    "Bearer",
    "Bearer first second",
    "Bearer ",
  ])(
    "rejects malformed authorization %s without querying",
    async (authorization) => {
      const headers = authorization
        ? { Authorization: authorization }
        : undefined;

      expect(
        await authorizeEditorRequest(
          new Request("http://localhost", { headers }),
        ),
      ).toBeNull();
      expect(mockEditorAuthorizationPoolQuery).not.toHaveBeenCalled();
    },
  );

  test("resolves the sole shop without exposing the token", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockEditorAuthorizationPoolQuery.mockResolvedValue({
      rows: [[authorizedShopID]],
    });

    try {
      const response = await authorizeEditorRequest(
        new Request("http://localhost", {
          headers: { Authorization: "Bearer existing-token" },
        }),
      );

      expect(response).toBe(authorizedShopID);
      expect(mockEditorAuthorizationPoolQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('"typeformtoken" = $1'),
        }),
        ["existing-token", 2],
      );
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });

  test("fails closed for duplicate or missing tokens", async () => {
    mockEditorAuthorizationPoolQuery.mockResolvedValueOnce({
      rows: [[authorizedShopID], [authorizedShopID]],
    });
    await expect(
      authorizeEditorRequest(
        new Request("http://localhost", {
          headers: { Authorization: "Bearer duplicate-token" },
        }),
      ),
    ).resolves.toBeNull();

    mockEditorAuthorizationPoolQuery.mockResolvedValueOnce({ rows: [] });
    await expect(
      authorizeEditorRequest(
        new Request("http://localhost", {
          headers: { Authorization: "Bearer missing-token" },
        }),
      ),
    ).resolves.toBeNull();
  });
});
