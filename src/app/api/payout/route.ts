import { NextRequest, NextResponse } from "next/server";
import {
  ID,
  databases,
  databaseId,
} from "../../../server-utils";
import { Query } from "node-appwrite";
import { User, TransactionData } from "../../../server-utils/types";
import { parentWalletAddress, parentPrivateKey } from "../../../server-utils";
import { decrypt } from "../../../auth-utils";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";

export async function POST(request: NextRequest) {
  if (request.method === "POST") {
    const reqData = await request.json();
    

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


    // not using the connection from alchemy because it is seems broken for confirmed transaction requests on devnet
    // const connection = new Connection( process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "" );

    let connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const userCollectionId = process.env.COLLECTION_ID_USERS || "";
    const transactionCollectionId = process.env.COLLECTION_ID_TRANSACTIONS || "";

    // signing the transaction on server

    const userData = await databases.getDocument(
        databaseId,
        userCollectionId,
        userId
        ) as User;

        const points = userData.points || 0;

        const amtInSol = parseFloat((points * 0.00001).toFixed(5))

        if (amtInSol < 0.01) {
            return NextResponse.json(
                { message: `Insufficient balance you have ${amtInSol} SOL`, status: "failed" },
                { status: 400 }
            );
        }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey(parentWalletAddress),
            toPubkey: new PublicKey(publickey),
            lamports: amtInSol * 1000000000,
        })
    );

    const keypair = Keypair.fromSecretKey(bs58.decode(parentPrivateKey));

    let signature = "";
    try {
        signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair],
        );
    
     } catch(e) {
        console.log(e);
        return NextResponse.json(
            { message: "Transaction failed", status: "failed" },
            { status: 400 }
        );
     }

     console.log(signature)

    const newTxnId = ID.unique();

    const paymentData: TransactionData = {
      txnId: newTxnId,
      txnSignature: signature,
      to: publickey,
      from: parentWalletAddress,
      amount: amtInSol * 1000000000,
      toUserId: userId,
      fromUserId: '1',
      status: "paid",
      type:  "receive",
    };

    try  {
        await databases.createDocument(
            databaseId,
            transactionCollectionId,
            newTxnId,
            paymentData
            );

            await databases.updateDocument(
                databaseId,
                userCollectionId,
                userId,
                {
                    points: 0,
                }
            );
    
        const resData = {
          txnId: newTxnId,
          txnSignature: signature,
          success: true,
          status: "paid",
          value: amtInSol,
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
