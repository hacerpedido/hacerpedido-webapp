const {
  hasApprovedTimestampFunctionConfig,
} = require("../../scripts/adopt-baseline.js");

describe("trigger_set_timestamp function configuration", () => {
  it("accepts the original baseline configuration", () => {
    expect(hasApprovedTimestampFunctionConfig(null)).toBe(true);
  });

  it("accepts only the approved #134 search path configuration", () => {
    expect(
      hasApprovedTimestampFunctionConfig(["search_path=pg_catalog, public"]),
    ).toBe(true);
  });

  it("rejects other function settings", () => {
    expect(hasApprovedTimestampFunctionConfig([])).toBe(false);
    expect(hasApprovedTimestampFunctionConfig(["search_path=public"])).toBe(
      false,
    );
    expect(
      hasApprovedTimestampFunctionConfig([
        "search_path=pg_catalog, public",
        "statement_timeout=10s",
      ]),
    ).toBe(false);
    expect(
      hasApprovedTimestampFunctionConfig("search_path=pg_catalog, public"),
    ).toBe(false);
  });
});
