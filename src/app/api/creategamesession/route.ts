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

        const questionCollectionId = process.env.COLLECTION_ID_QUESTIONS || "";
        const quizSessionsCollectionId = process.env.COLLECTION_ID_QUIZSESSIONS || "";
        const userCollectionId = process.env.COLLECTION_ID_USERS || "";
        const questionSetCollectionId = process.env.COLLECTION_ID_QUESTIONSET || "";
        const newId = ID.unique();

        // Making a new entry for the quiz session
        const userId = parsed.user.id; // get this from the request or session like parsed.user.id
        const questionSetId = reqData.setId;

        const questionSetData = await databases.getDocument(
            databaseId,
            questionSetCollectionId,
            questionSetId
        ) as QuestionSetData;

        const allQuestionIds = questionSetData.questionIds;

        if (!allQuestionIds || allQuestionIds.length === 0) {
            return NextResponse.json({ message: "No questions found in the set" }, { status: 405 });
        }

        const randomSuffeledQuestions = (numberOfQuestions: number) => {
            const suffeledQuestions = allQuestionIds.sort(() => Math.random() - 0.5);
            return suffeledQuestions.slice(0, numberOfQuestions);
        }

        // get 5 random questions from the set
        const questionIds = randomSuffeledQuestions(5) as string[];

        const data: QuizSession = {
            quizSessionId: newId,
            userId: userId,
            questionIds: questionIds,
            totalPoints: 0,
            ended: false,
            setId: questionSetData.setId,
            setTitle: questionSetData.setTitle,
            imageUrl: questionSetData.imageUrl,
        };

        await databases.createDocument(
            databaseId,
            quizSessionsCollectionId,
            newId,
            data
        );


        // update the user with the new quiz session ToDo: check if this is needed (4 db calls)

        const actualUserId = userId;

        const user = await databases.getDocument(
            databaseId,
            userCollectionId,
            actualUserId
        );

        const quizSessions = user["quizSessions"] || [];
        quizSessions.push(newId);

        const updatedUser = {
            quizSessions: quizSessions,
        };

        await databases.updateDocument(
            databaseId,
            userCollectionId,
            actualUserId,
            updatedUser,
        );




        const finalSessionId = newId;

        const responcedata = {
            quizSession: finalSessionId,
        }
        

        return NextResponse.json( responcedata, { status: 200 });

    } catch (error) {
        console.error("Error in POST request:", error);

        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON input" }, { status: 400 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
