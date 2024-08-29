import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { databases, databaseId, ID } from '../../../server-utils';
import { User } from '../../../server-utils/types';
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
    const reqData = await request.json();

    const limit = reqData.limit || 30;

    const session = request.cookies.get("session")?.value;

    if (!session) {
        return NextResponse.json({ message: "Unauthorized you dont have the right access" }, {status: 401});
    }

    const parsed = await decrypt(session);

    console.log("getUser", parsed);

    if(!parsed.user) {
        return NextResponse.json({ message: "Bad request incorrect token" }, {status: 400});
    }

    if (request.method !== "POST") {
        return NextResponse.json({ message: "This Method Not Allowed" }, {status: 405});
    }

    const userId = parsed.user.id;
    const userCollectionId = process.env.COLLECTION_ID_USERS || "";
    const transactionCollectionId = process.env.COLLECTION_ID_TRANSACTIONS || "";

    try {
        // get the users leader board

        const userData = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [
                Query.orderDesc("locked"),
                Query.orderAsc("avgAnswerTime"),
                Query.orderDesc("totalGames"),
                Query.limit(limit),
            ]
        );

        const users = userData.documents.map((user) => {
            return {
                name: user.name,
                avgtime: user.avgAnswerTime,
                matches: user.totalGames,
                publickey: user.walletPublicKey,
                locked: user.locked,
                };
            });


    
        return NextResponse.json(users, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error getting the user" }, {status: 400});
    }
}
