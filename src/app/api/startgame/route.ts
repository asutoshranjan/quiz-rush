import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { QuizSession } from '../../../server-utils/types';
import { databases, databaseId, ID } from '../../../server-utils';
import { Query } from 'node-appwrite';

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

    const userId = parsed.user.id;
    const quizSessionId = reqData.quizSession

    const questionCollectionId = process.env.COLLECTION_ID_QUESTIONS || "";
    const quizSessionsCollectionId = process.env.COLLECTION_ID_QUIZSESSIONS || "";

    // finds and sends the quiz questions to the user in current session

    const quizsession = await databases.getDocument(databaseId, quizSessionsCollectionId, quizSessionId) as QuizSession;

    if (!quizsession) {
        return NextResponse.json({ message: "Quiz session not found" }, {status: 404});
    }

    if (quizsession.userId !== userId) {
        return NextResponse.json({ message: "Access to this session is not allow the user" }, {status: 401});
    }

    if (quizsession.ended === true) {
        return NextResponse.json({ message: "Quiz session has ended" }, {status: 400});
    }

    if(quizsession.startTime) {
        return NextResponse.json({ message: "Can't restart the quiz session" }, {status: 400});
    }

    const questionIds = quizsession.questionIds as string[];

    const questionDocuments = await databases.listDocuments(
        databaseId,
        questionCollectionId,
        [Query.contains("questionId", questionIds)]
    );
    

    const arrangedQuestions = questionIds.map((questionId) => {
        const question = questionDocuments.documents.find((question) => question.questionId === questionId);
        return {
          questionId: question?.questionId,
          title: question?.title,
          optionA: question?.optionA,
          optionB: question?.optionB,
          optionC: question?.optionC,
          optionD: question?.optionD,
          type: question?.type,
        };
      });

    console.log(arrangedQuestions);

    const questionData = {
        questions: arrangedQuestions,
        total: arrangedQuestions.length,
        setTitle: quizsession.setTitle,
    }

    const startTime = new Date().toISOString();
    const updatedata = {
        startTime: startTime,
    }
    await databases.updateDocument(
        databaseId,
        quizSessionsCollectionId,
        quizSessionId,
        updatedata
    );

    return NextResponse.json(questionData, {status: 200});
}