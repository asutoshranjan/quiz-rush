import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { databases, databaseId, ID } from '../../../server-utils';
import { User } from '../../../server-utils/types';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {

    const session = request.cookies.get("session")?.value;

    if (!session) {
        return NextResponse.json({ message: "Unauthorized you dont have the right access" }, {status: 401});
    }

    const parsed = await decrypt(session);

    console.log("getUser", parsed);

    if(!parsed.user) {
        return NextResponse.json({ message: "Bad request incorrect token" }, {status: 400});
    }

    if (request.method !== "GET") {
        return NextResponse.json({ message: "This Method Not Allowed" }, {status: 405});
    }

    const userId = parsed.user.id;
    const userCollectionId = process.env.COLLECTION_ID_USERS || "";
    const transactionCollectionId = process.env.COLLECTION_ID_TRANSACTIONS || "";

    try {
        // get the user payout history

        const myTransactionsData = await databases.listDocuments(
            databaseId,
            transactionCollectionId,
            [
                Query.equal("type", "receive"),
                Query.equal("toUserId", userId),
                Query.orderDesc("$updatedAt"),
                
            ]
        );

        const transactions = myTransactionsData.documents.map((transaction) => {
            return {
                txnSignature: transaction.txnSignature,
                amount: transaction.amount,
                status: transaction.status,
                updatedAt: transaction.$updatedAt,
                };
            });


            const resData = {
                transactions: transactions,
                total: myTransactionsData.total,
            }

    
        return NextResponse.json(resData, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error getting the user" }, {status: 400});
    }
}
