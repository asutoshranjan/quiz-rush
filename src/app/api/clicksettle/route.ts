import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "../../../auth-utils";
import { Question, QuestionSetData } from "../../../server-utils/types";
import { databases, databaseId, ID } from "../../../server-utils";

export async function POST(request: NextRequest) {
  const reqData = await request.json();

  const txnId = reqData.txnId;

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

  // makes a new entry in the database for the question

  const actualUserId = parsed.user.id; // match this with user id of session as parsed.user.$id
  const userCollectionId = process.env.COLLECTION_ID_USERS || "";
  const questionSetCollectionId = process.env.COLLECTION_ID_QUESTIONSET || "";
  const transactionCollectionId = process.env.COLLECTION_ID_TRANSACTIONS || "";

  try {
    const response = await databases.updateDocument(
      databaseId,
      transactionCollectionId,
      txnId,
      {
        clicked: true,
      }
    );

    return NextResponse.json({ clicked: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error updating transaction" },
      { status: 400 }
    );
  }
}
