import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "../../../auth-utils";
import { Question, QuizSession, Responce } from "../../../server-utils/types";
import { databases, databaseId, ID } from "../../../server-utils";
import { Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  // set the end time of the quiz session
  const endTime = new Date().toISOString();

  const reqData = await request.json();

  const session = request.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized you dont have the right access" },
      { status: 401 }
    );
  }

  const parsed = await decrypt(session);

  if (!parsed.user) {
    return NextResponse.json(
      { message: "Bad request incorrect token" },
      { status: 400 }
    );
  }

  console.log(parsed);

  if (request.method !== "POST") {
    return NextResponse.json(
      { message: "This Method Not Allowed" },
      { status: 405 }
    );
  }

  const userId = parsed.user.id; 
  const quizSessionId = reqData.quizSession;
  const userAnswer = reqData.userAnswer;

  const userCollectionId = process.env.COLLECTION_ID_USERS || "";
  const questionCollectionId = process.env.COLLECTION_ID_QUESTIONS || "";
  const quizSessionsCollectionId = process.env.COLLECTION_ID_QUIZSESSIONS || "";
  const responcesCollectionId = process.env.COLLECTION_ID_RESPONCES || "";

  try {
    const quizsession = (await databases.getDocument(
      databaseId,
      quizSessionsCollectionId,
      quizSessionId
    )) as QuizSession;

    if (!quizsession) {
      return NextResponse.json(
        { message: "Quiz session not found" },
        { status: 404 }
      );
    }

    if (quizsession.userId !== userId) {
      return NextResponse.json(
        { message: "Access to this session is not allow the user" },
        { status: 401 }
      );
    }

    if (quizsession.ended === true) {
      return NextResponse.json(
        { message: "Quiz session has ended" },
        { status: 400 }
      );
    }

    const questionIds = quizsession.questionIds as string[];

    const questions = await databases.listDocuments(
      databaseId,
      questionCollectionId,
      [Query.contains("questionId", questionIds)]
    );

    // arrage the questions in the order of the questionIds and return the questions
    const arrangedQuestions = questionIds.map((questionId) => {
      const question = questions.documents.find(
        (question) => question.questionId === questionId
      );
      return question;
    }) as Question[];

    console.log(questions.documents);

    const { answersList, questionsList } = arrangedQuestions.reduce(
      (acc, question) => {
        acc.answersList.push(question.answer as string);
        acc.questionsList.push(question.title as string);
        return acc;
      },
      { answersList: [], questionsList: [] } as {
        answersList: string[];
        questionsList: string[];
      }
    );

    console.log(answersList, questionsList);

    // check if answer array matches the user answer array reward 10 points for each correct answer
    let totalPoints = 0;
    for (let i = 0; i < answersList.length; i++) {
      if (
        answersList[i].trim().toLowerCase() ===
        userAnswer[i].trim().toLowerCase()
      ) {
        totalPoints += 10;
      }
    }

    const resId = ID.unique();

    const submitResponce: Responce = {
      responceId: resId,
      sessionId: quizSessionId,
      userId: userId,
      answers: userAnswer,
      pointsGiven: totalPoints,
      endTime: endTime,
      correctAnswers: answersList,
      questions: questionsList,
    };

    const addResponceRequest = await databases.createDocument(
      databaseId,
      responcesCollectionId,
      resId,
      submitResponce
    );

    // set the end time of the quiz session and update the total points, time taken
    const sessionStartTime = quizsession.startTime;

    const start = new Date(sessionStartTime!).getTime();
    const end = new Date(endTime).getTime();

    const timedifference = (end - start) / 1000;

    // if the time taken is more than 12 seconds in buffer responce is notvalid from the user
    if (timedifference > 54) {
      return NextResponse.json(
        { message: "Responce is not valid exceeded time limit" },
        { status: 400 }
      );
    }

    const timeTaken =
      timedifference > 40 ? "40.000" : timedifference.toFixed(3);

    const updatedata: QuizSession = {
      endTime: endTime,
      totalPoints: totalPoints,
      time: timeTaken,
      ended: true,
      responceId: resId,
    };

    await databases.updateDocument(
      databaseId,
      quizSessionsCollectionId,
      quizSessionId,
      updatedata
    );

    //ToDo: check for optimization (6 db calls?)

    // add points to the user
    const actualUserId = userId; // match this or get it from the session as parsed.user.$id

    const myUser = await databases.getDocument(
      databaseId,
      userCollectionId,
      actualUserId
    );

    const updatedUserData = {
      points: myUser.points + totalPoints,
      locked: myUser.locked + totalPoints,
      totalGames: myUser.totalGames + 1,
      avgAnswerTime: (myUser.avgAnswerTime + parseFloat(timeTaken)) / 2,
    };

    await databases.updateDocument(
      databaseId,
      userCollectionId,
      actualUserId,
      updatedUserData
    );

    return NextResponse.json(
      { ...addResponceRequest, time: timeTaken },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
