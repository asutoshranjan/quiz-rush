import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { Question } from '../../../server-utils/types'
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

    // makes a new entry in the database for the question

    const questionCollectionId = process.env.COLLECTION_ID_QUESTIONS || "";
    const newId = ID.unique();
    const questionSetId = reqData.setId;

    const data: Question = {
        title: reqData.title,
        answer: reqData.answer,
        optionA: reqData.optionA,
        optionB: reqData.optionB,
        optionC: reqData.optionC,
        optionD: reqData.optionD,
        type: reqData.type || "mcq",
        questionId: newId,
        questionSetId: questionSetId,
    };

    const addQuestionRequest = await databases.createDocument(
        databaseId,
        questionCollectionId,
        newId,
        data
    );

    console.log(addQuestionRequest);
    

    return NextResponse.json(addQuestionRequest, {status: 200});

}