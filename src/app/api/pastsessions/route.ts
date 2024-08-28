import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { QuizSession, QuestionSetData } from '../../../server-utils/types';
import { databases, databaseId, ID } from '../../../server-utils';
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
    try {
        const reqData = await request.json();

        const session = request.cookies.get("session")?.value;

        if (!session) {
            return NextResponse.json({ message: "Unauthorized: You don't have the right access" }, { status: 401 });
        }

        const parsed = await decrypt(session);

        if (!parsed.user) {
            return NextResponse.json({ message: "Bad request: Incorrect token" }, { status: 400 });
        }

        console.log(parsed);

        if (request.method !== "POST") {
            return NextResponse.json({ message: "This Method is Not Allowed" }, { status: 405 });
        }

        const quizSessionsCollectionId = process.env.COLLECTION_ID_QUIZSESSIONS || "";

        const page = reqData.page;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Making a new entry for the quiz session
        const userId = parsed.user.id; // get this from the request or session like parsed.user.id
        

        // get all quizSession for the user
        // adjust offset according to the page number sent in the request
        const quizSessions = await databases.listDocuments(
            databaseId,
            quizSessionsCollectionId,
            [Query.equal("userId", userId), Query.orderDesc("$updatedAt"), Query.limit(limit), Query.offset(offset)],
        );
        

        return NextResponse.json( quizSessions, { status: 200 });

    } catch (error) {
        console.error("Error in POST request:", error);

        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON input" }, { status: 400 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
