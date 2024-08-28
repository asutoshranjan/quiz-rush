import * as sdk from "node-appwrite";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
// const sdk = require('node-appwrite');

let client = new sdk.Client();

const endpoint = process.env.APPWRITE_ENDPOINT || "";
const projectID = process.env.APPWRITE_PROJECT || "";
const secret = process.env.SERVER_KEY || "";
const databaseId = process.env.DATABASE_ID || "";

client
  .setEndpoint(endpoint) // Your API Endpoint
  .setProject(projectID) // Your project ID
  .setKey(secret); // Your secret API key

const databases = new sdk.Databases(client);
const ID = sdk.ID;

// function to generate random name
function generateRandomName(): string {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    length: 2,
    separator: "-",
  });
  return randomName;
}

const parentWalletAddress = process.env.PARENT_WALLET_ADDRESS || "";
const parentPrivateKey = process.env.PARENT_PRIVATE_KEY || "";

export { client, databases, databaseId, ID, generateRandomName, parentWalletAddress, parentPrivateKey };
