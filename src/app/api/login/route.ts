import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "../../../auth-utils";
import { databases, databaseId } from "../../../server-utils";
import { Query } from "node-appwrite";
import { User } from "../../../server-utils/types";
import nacl from "tweetnacl";
import bs58 from "bs58";

export async function POST(request: NextRequest) {
  if (request.method == "POST") {
    const reqData = await request.json();

    const publickey = reqData.publickey;
    const signature = reqData.signature;

    const userCollectionId = process.env.COLLECTION_ID_USERS || "";

    //Verify the signature using the public key

    // 1 get signing message for this public key user
    try {
      const requestedUser = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.equal("walletPublicKey", publickey)]
      );

      // base 58 public key to Uint8Array
      const publicKey = bs58.decode(publickey);

      console.log("publicKey", publicKey);

      const signignMessage = requestedUser.documents[0].signatureValue;
      console.log("signignMessage", signignMessage);

      const messageBytes = new TextEncoder().encode(signignMessage);
      console.log("messageBytes", messageBytes);

      // format signature
      let formattedSignature;
      if (Array.isArray(signature.data)) {
        // Format 1: signature has a 'data' array # for Phantom
        formattedSignature = new Uint8Array(signature.data);
      } else {
        // Format 2: signature is an object with numbered properties # for Bagpack
        const signatureArray: any[] = Object.values(signature);
        formattedSignature = new Uint8Array(signatureArray);
      }
      console.log("formattedSignature", formattedSignature);

      const result = nacl.sign.detached.verify(
        messageBytes,
        formattedSignature,
        publicKey
      );

      console.log("result", result);

      if (result === true) {
        const myUser = requestedUser.documents[0] as User;

        const user = {
          id: myUser.userId,
          name: myUser.name,
          publickey: myUser.walletPublicKey,
        };

        const expires = new Date(Date.now() + 20 * 60000); // 20 minutes
        const session = await encrypt({ user, expires });

        // Set the cookie with the session
        const response = NextResponse.json({ success: true }, { status: 200 });

        // Set the cookie on the response
        response.cookies.set({
          name: "session",
          value: session,
          httpOnly: true,
          expires: expires,
          path: "/", // Ensure it's set on the root path
        });

        return response;
      } else {
        return NextResponse.json(
          { message: "Invalid Signature" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Error in user login" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }
}
