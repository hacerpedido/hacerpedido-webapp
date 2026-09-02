const originalConsoleError = console.error;

function formatConsoleErrorCall(args) {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }

      if (typeof arg === "string") {
        return arg;
      }

      try {
        const serialized = JSON.stringify(arg);
        return serialized === undefined ? String(arg) : serialized;
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}

beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  const mockedConsoleError = console.error;
  const calls = mockedConsoleError?.mock?.calls ?? [];

  console.error = originalConsoleError;

  if (calls.length > 0) {
    const details = calls
      .map((args, index) => `${index + 1}. ${formatConsoleErrorCall(args)}`)
      .join("\n");

    throw new Error(`Unexpected console.error call(s):\n${details}`);
  }
});
