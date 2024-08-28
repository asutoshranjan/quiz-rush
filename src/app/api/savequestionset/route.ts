import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { Question, QuestionSetData } from '../../../server-utils/types'
import { databases, databaseId, ID } from '../../../server-utils'

export async function POST(request: NextRequest) {
    const reqData = await request.json(); 

    const session = request.cookies.get("session")?.value;

    if (!session) {
        return NextResponse.json({ message: "Unauthorized you dont have the right access" }, {status: 401});
    }

    const parsed = await decrypt(session);

    if(!parsed.user) {
        return NextResponse.json({ message: "Bad request incorrect token" }, {status: 400});
    }

    console.log(parsed);

    if (request.method !== "POST") {
        return NextResponse.json({ message: "This Method Not Allowed" }, {status: 405});
    }

    // makes a new entry in the database to update the question set with questions

    const setId = reqData.setId;
    const questionIds = reqData.questions;

    
    const questionSetCollectionId = process.env.COLLECTION_ID_QUESTIONSET || "";

    const data = {
        questionIds: questionIds,
    };
    console.log(data);

    try {

        const addNewQuestionSet = await databases.updateDocument(
            databaseId,
            questionSetCollectionId,
            setId,
            data,
        );
    
        console.log(addNewQuestionSet);
        
    
        return NextResponse.json(addNewQuestionSet, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error updating the question set" }, {status: 400});
    }
}
