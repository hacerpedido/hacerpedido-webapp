const mockReadFileSync = jest.fn();
const mockSend = jest.fn();
const mockS3Client = jest.fn(() => ({ send: mockSend }));
const mockPutObjectCommand = jest.fn((input) => ({ input }));
const mockDeleteObjectCommand = jest.fn((input) => ({ input }));

jest.mock("node:fs", () => ({ readFileSync: mockReadFileSync }));
jest.mock("@aws-sdk/client-s3", () => ({
  DeleteObjectCommand: mockDeleteObjectCommand,
  PutObjectCommand: mockPutObjectCommand,
  S3Client: mockS3Client,
}));

// Deferred require: an ESM import would be hoisted above the shared mock
// handles, making the node:fs mock factory run before they initialize.
const { deleteFile, uploadFile } =
  require("./aws-s3") as typeof import("./aws-s3");

describe("S3 image utilities", () => {
  const originalEnvironment = {
    accessKeyId: process.env.HP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.HP_AWS_SECRET_ACCESS_KEY,
    imagesBucket: process.env.HP_AWS_IMAGES_BUCKET,
    region: process.env.AWS_REGION,
  };

  beforeEach(() => {
    mockReadFileSync.mockReset().mockReturnValue(Buffer.from("image data"));
    mockSend.mockReset().mockResolvedValue({});
    mockS3Client.mockClear();
    mockPutObjectCommand.mockClear();
    mockDeleteObjectCommand.mockClear();
    process.env.HP_AWS_ACCESS_KEY_ID = "test-access-key";
    process.env.HP_AWS_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.HP_AWS_IMAGES_BUCKET = "test-images-bucket";
    delete process.env.AWS_REGION;
  });

  afterEach(() => {
    const environment = {
      HP_AWS_ACCESS_KEY_ID: originalEnvironment.accessKeyId,
      HP_AWS_SECRET_ACCESS_KEY: originalEnvironment.secretAccessKey,
      HP_AWS_IMAGES_BUCKET: originalEnvironment.imagesBucket,
      AWS_REGION: originalEnvironment.region,
    };

    for (const [name, value] of Object.entries(environment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  test("uploads a local file with the expected PutObject parameters", async () => {
    const fileContent = Buffer.from("uploaded image");
    mockReadFileSync.mockReturnValue(fileContent);
    process.env.AWS_REGION = "eu-west-1";

    await uploadFile("/tmp/image.png", "shops/shop-id/logo.png", "image/png");

    expect(mockReadFileSync).toHaveBeenCalledWith("/tmp/image.png");
    expect(mockS3Client).toHaveBeenCalledWith({
      region: "eu-west-1",
      followRegionRedirects: true,
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
      },
    });
    expect(mockPutObjectCommand).toHaveBeenCalledWith({
      Bucket: "test-images-bucket",
      Key: "shops/shop-id/logo.png",
      Body: fileContent,
      ContentType: "image/png",
      ACL: "public-read",
    });
    expect(mockSend).toHaveBeenCalledWith({ input: expect.any(Object) });
  });

  test("deletes an object with the expected DeleteObject parameters", async () => {
    await deleteFile("shops/shop-id/logo.png");

    expect(mockS3Client).toHaveBeenCalledWith({
      region: "us-east-1",
      followRegionRedirects: true,
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
      },
    });
    expect(mockDeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: "test-images-bucket",
      Key: "shops/shop-id/logo.png",
    });
    expect(mockSend).toHaveBeenCalledWith({ input: expect.any(Object) });
  });

  test("propagates a rejected upload send", async () => {
    const failure = new Error("S3 unavailable");
    mockSend.mockRejectedValue(failure);

    await expect(
      uploadFile("/tmp/image.png", "image.png", "image/png"),
    ).rejects.toBe(failure);
  });

  test("propagates a rejected delete send", async () => {
    const failure = new Error("S3 unavailable");
    mockSend.mockRejectedValue(failure);

    await expect(deleteFile("image.png")).rejects.toBe(failure);
  });
});
