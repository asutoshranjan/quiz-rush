import { Client, Account, Databases } from 'appwrite';

const projectID = process.env.NEXT_PUBLIC_APPWRITE_CLIENT_PROJECT || "";
const databaseID =    process.env.NEXT_PUBLIC_DATABASE_ID || "";
const collectionID = process.env.NEXT_PUBLIC_COLLECTION_ID || "";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(projectID);


  export const databases = new Databases(client)


export { client, databaseID, collectionID };