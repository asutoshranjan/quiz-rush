import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { QuizSession, Responce } from '../../../server-utils/types';
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

    const userId = parsed.user.id; // or get it from the session as parsed.user.id
    const quizSessionId = reqData.quizSession

    const quizSessionsCollectionId = process.env.COLLECTION_ID_QUIZSESSIONS || "";
    const responcesCollectionId = process.env.COLLECTION_ID_RESPONCES || "";

    // finds the next question id of the user or if its the entry or exit of the session

    try {
        const quizsession = await databases.getDocument(databaseId, quizSessionsCollectionId, quizSessionId) as QuizSession;

    if (!quizsession) {
        return NextResponse.json({ message: "Quiz session not found" }, {status: 404});
    }

    if (quizsession.userId !== userId) {
        return NextResponse.json({ message: "Access to this session is not allow the user" }, {status: 401});
    }

    if (quizsession.ended === true) {
        const sessionResponce = await databases.getDocument(databaseId, responcesCollectionId, quizsession.responceId!) as Responce; 
        const responceData = {
            quizEnded: true,
            responceId: sessionResponce.responceId,
            sessionId: sessionResponce.sessionId,
            userId: sessionResponce.userId,
            answers: sessionResponce.answers,
            pointsGiven: quizsession.totalPoints,
            endTime: sessionResponce.endTime,
            correctAnswers: sessionResponce.correctAnswers,
            questions: sessionResponce.questions,
            setTitle: quizsession.setTitle,
            time: quizsession.time,
            imageUrl: quizsession.imageUrl,
        }

        return NextResponse.json(responceData, {status: 200});
    }

    if(quizsession.startTime) {
        const alreadyStarted = {
            quizEnded: false,
            invalid: true,
            message: "This session has an invalid entry, can't restart play new game",
            setTitle: quizsession.setTitle,
            sessionId: quizsession.quizSessionId,
        };
        return NextResponse.json(alreadyStarted, {status: 200});
    }

    const resData = {
        quizEnded: false,
        setTitle: quizsession.setTitle,
        sessionId: quizsession.quizSessionId,
        imageUrl: quizsession.imageUrl,
    }
    return NextResponse.json(resData, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error in getting session details" }, {status: 400});
    }
}
