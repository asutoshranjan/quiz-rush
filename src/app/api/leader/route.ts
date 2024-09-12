import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { databases, databaseId, ID } from '../../../server-utils';
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
    const reqData = await request.json();

    const limit = reqData.limit || 30;

    if (request.method !== "POST") {
        return NextResponse.json({ message: "This Method Not Allowed" }, {status: 405});
    }

    const userCollectionId = process.env.COLLECTION_ID_USERS || "";

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
