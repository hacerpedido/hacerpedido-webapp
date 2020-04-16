// npx babel --presets es2015 -d build-scripts/ src/graphql scripts/get-shops.js src/aws-exports.js && node build-scripts/scripts/get-shops.js

import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";
import { createShop, updateShop } from "../mutations";
import slugify from "slugify";

const { google } = require("googleapis");

API.configure(awsconfig);
