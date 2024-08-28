import { NextRequest, NextResponse } from "next/server";
import {
  generateRandomName,
  ID,
  databases,
  databaseId,
} from "../../../server-utils";
import { Query } from "node-appwrite";
import { User, TransactionData } from "../../../server-utils/types";
import { parentWalletAddress } from "../../../server-utils";
import { decrypt } from "../../../auth-utils";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function POST(request: NextRequest) {
  if (request.method === "POST") {
    const reqData = await request.json();
    const txnSignature = reqData.txnSignature;
    console.log("txnSignature", txnSignature);

    // Checking if a transaction sent by the user is valid
    const session = request.cookies.get("session")?.value;

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized you don't have the right access" },
        { status: 401 }
      );
    }

    const parsed = await decrypt(session);
    console.log("getUser", parsed);

    if (!parsed.user) {
      return NextResponse.json(
        { message: "Bad request, incorrect token" },
        { status: 400 }
      );
    }

    const userId = parsed.user.id;
    const publickey = parsed.user.publickey;
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || ""
    );

    const userCollectionId = process.env.COLLECTION_ID_USERS || "";
    const transactionCollectionId = process.env.COLLECTION_ID_TRANSACTIONS || "";

    const newTxnId = ID.unique();

    const paymentData: TransactionData = {
      txnId: newTxnId,
      txnSignature: txnSignature,
      from: publickey,
      to: parentWalletAddress,
      amount: 10000000,
      toUserId: "1",
      fromUserId: userId,
      status: "created",
      type: "pay",
    };

    try  {
        await databases.createDocument(
            databaseId,
            transactionCollectionId,
            newTxnId,
            paymentData
            );
    
        const resData = {
          txnId: newTxnId,
          txnSignature: txnSignature,
          entry: true,
        };
    
        return NextResponse.json(resData, { status: 200 });
    }  catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Failed to create transaction entry" },
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
