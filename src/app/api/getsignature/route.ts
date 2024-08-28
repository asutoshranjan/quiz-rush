import { NextRequest, NextResponse } from "next/server";
import {
  generateRandomName,
  ID,
  databases,
  databaseId,
} from "../../../server-utils";
import { Query } from "node-appwrite";
import { User } from "../../../server-utils/types";

export async function POST(request: NextRequest) {
  if (request.method == "POST") {
    const reqData = await request.json();

    //Send a signing message to the user

    const name = reqData.name;
    const publickey = reqData.publickey;

    const userCollectionId = process.env.COLLECTION_ID_USERS || "";

    // 1 get signing message for this public key user
    // 2 if user does not exist in the database, create a new user entry and get the signing message

    const requestedUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("walletPublicKey", publickey)]
    );

    const newSigningMessage = `Signing to QuizRush ${ID.unique().substring(
      0,
      4
    )}`;

    if (requestedUser.documents.length === 0) {
      // creating new user
      const newId = ID.unique();

      const newUser: User = {
        userId: newId,
        name: name == "" ? generateRandomName() : name,
        walletPublicKey: publickey,
        signatureValue: newSigningMessage,
      };

      await databases.createDocument(
        databaseId,
        userCollectionId,
        newId,
        newUser
      );
    } else {
      // get from the existing user
      const user = requestedUser.documents[0];
      const setUserName = name == "" ? user.name : name;

      await databases.updateDocument(databaseId, userCollectionId, user.$id, {
        name: setUserName,
        signatureValue: newSigningMessage,
      });
    }

    const resData = {
      signingMessage: newSigningMessage,
    };

    return NextResponse.json(resData, { status: 200 });
  } else {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }
}
