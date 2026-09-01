import path from "path";

const composeFilePath = path.resolve(__dirname, "../../../compose.e2e.yaml");

export const databaseConfig = {
  composeFile: composeFilePath,
  composeProject: "hacerpedido-e2e",
  pgConnectionString:
    "postgresql://e2e_user:e2e_password@127.0.0.1:54329/hacerpedido_e2e",
};

export const { composeFile, composeProject, pgConnectionString } =
  databaseConfig;
