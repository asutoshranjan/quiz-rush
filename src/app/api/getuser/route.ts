import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { databases, databaseId, ID } from '../../../server-utils';
import { User } from '../../../server-utils/types';

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

    try {
        const currentUser = await databases.getDocument(
            databaseId,
            userCollectionId,
            actualUserId
        ) as User;
    
        
    
        return NextResponse.json(currentUser, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error getting the user" }, {status: 400});
    }
}
