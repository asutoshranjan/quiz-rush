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
    const txnId = reqData.txnId;
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
    const transactionCollectionId =
      process.env.COLLECTION_ID_TRANSACTIONS || "";


      console.log("txnId", txnId);
    const transactionData = await databases.getDocument(
      databaseId,
      transactionCollectionId,
      txnId
    ) as TransactionData;

    console.log("transactionData", transactionData);

    try {
      // Implementing the retry logic to check transaction every 3 seconds for max 8 times
      const maxAttempts = 8;
      const interval = 3000;

      let transaction = null;
      for (let attempts = 0; attempts < maxAttempts; attempts++) {
        transaction = await connection.getTransaction(txnSignature, {
          maxSupportedTransactionVersion: 1,
        });

        if (transaction) {
          break; // Exit the loop if the transaction is found
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
      }

      // If the transaction is still not found, return an error
      if (!transaction) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            status: "failed",
          }
        );

        return NextResponse.json(
          {
            message: "Transaction not found after maximum attempts.",
            status: "failed",
          },
          { status: 400 }
        );
      }

      // got the txn!!
      console.log(transaction);

      const txnType = transactionData.type;

      if (
        (transaction?.meta?.postBalances[1] ?? 0) -
          (transaction?.meta?.preBalances[1] ?? 0) !== transactionData.amount
      ) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            status: "invalid amount",
          }
        );

        return NextResponse.json(
          {
            message: "Transaction amount or signature is not correct",
            status: "invalid amount",
          },
          { status: 406 }
        );
      }

      if (
        transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
        transactionData.to
      ) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            status: "invalid transaction",
          }
        );

        return NextResponse.json(
          {
            message: "Transaction to some other address than QuizRush",
            status: "invalid transaction",
          },
          { status: 406 }
        );
      }

      if (
        transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
        transactionData.from
      ) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            status: "invalid transaction",
          }
        );
        return NextResponse.json(
          {
            message: "Transaction from some other address than logged-in user",
            status: "invalid transaction",
          },
          { status: 406 }
        );
      }

      await databases.updateDocument(
        databaseId,
        transactionCollectionId,
        txnId,
        {
          status: "success",
        }
      );

      const resData = {
        to: transactionData.to,
        from: transactionData.from,
        amount: transactionData.amount,
        txnId: txnId,
        status: "success",
      };

      return NextResponse.json(resData, { status: 200 });
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Error getting the transaction details" },
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
