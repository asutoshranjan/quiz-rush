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


    

    const actualUserId = parsed.user.id; // match this with user id of session as parsed.user.$id
    const userCollectionId = process.env.COLLECTION_ID_USERS || "";
    const questionSetCollectionId = process.env.COLLECTION_ID_QUESTIONSET || "";
    const transactionCollectionId = process.env.COLLECTION_ID_TRANSACTIONS || "";

    try {

        // TODO: Check if there is a past transaction that was not clicked next and give the txn else data: null

        const myTransactionsData = await databases.listDocuments(
            databaseId,
            transactionCollectionId,
            [
                Query.equal("type", "pay"),
                Query.equal("fromUserId", actualUserId),
                Query.equal("clicked", false),
                Query.orderDesc("$updatedAt"),
                
            ]
        );

        const lastTransaction = myTransactionsData.documents[0];

        // is there a question set for this transaction if yes return null as for last txn question set is created

        const getQuestionSet = await databases.listDocuments( 
            databaseId,
            questionSetCollectionId,
            [
                Query.equal("byUserId", actualUserId),
                Query.equal("txnId", lastTransaction.txnId),
            ]
        );

        if(getQuestionSet.total > 0) {
            return NextResponse.json({data: false}, {status: 200});
        }

        const resData = {
            ...lastTransaction,
            data: true,
        };
    
        return NextResponse.json(resData, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error getting the user" }, {status: 400});
    }
}
