import {NextRequest, NextResponse } from 'next/server';
import { decrypt } from "../../../auth-utils";
import { databases, databaseId, ID } from '../../../server-utils'
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest) {

    if (request.method !== "POST") {
        return NextResponse.json({ message: "This Method Not Allowed" }, {status: 405});
    }


    const questionSetCollectionId = process.env.COLLECTION_ID_QUESTIONSET || "";


    try {

        const getAllValidQuestionSets = await databases.listDocuments(
            databaseId,
            questionSetCollectionId,
            [Query.equal("approved", true), Query.orderAsc("$updatedAt")]
        );

        const questionSets = getAllValidQuestionSets.documents;

        // map and only return setId setTitle imageUrl
        const responcedata = questionSets.map((questionSet) => {
            return {
                setId: questionSet.setId,
                setTitle: questionSet.setTitle,
                imageUrl: questionSet.imageUrl,
                category: questionSet.category,
            }
        }
        );
    
        return NextResponse.json(responcedata, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error updating the question set" }, {status: 400});
    }
}
