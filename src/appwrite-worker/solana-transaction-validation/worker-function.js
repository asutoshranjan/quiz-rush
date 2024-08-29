// this listens to the database events and gets trigerred when a new transaction is added to the transactions collection

import { Client, Databases } from 'node-appwrite';
import { Connection, clusterApiUrl } from "@solana/web3.js";


export default async ({ req, res, log, error }) => {

  const endpoint = "https://cloud.appwrite.io/v1"
  const projectID = process.env.PROJECT_ID
  const secret = process.env.APPWRITE_API_KEY

  const client = new  Client()
  .setEndpoint(endpoint)
  .setProject(projectID)
  .setKey(secret);

  const databases = new Databases(client);

  // You can log messages to the console
  const transactionCollectionId = "66ceff79002e20e9e36f"
  const databaseId  = "66c898ea00367b3b392b"
  const event = req.headers['x-appwrite-event']
  log(event)
  const eventParts = event.split('.');
  const documentId = eventParts[eventParts.length - 2];
 
  log('Hello, Triggered!');


  // write hi to the event triggered document
  const update = {
    fromServer: 'hi!'
  }

  const request = await databases.updateDocument(
    databaseId,
    transactionCollectionId,
    documentId,
    update,
);

  log(request)
  

    const txnId = request.txnId;
    const txnSignature = request.txnSignature;
    log("txnSignature", txnSignature);
    log("transactionData", request);


    let connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    try {
      // Implementing the retry logic to check transaction every 3 seconds for max 5 times
      const maxAttempts = 5;
      const interval = 3000;

      let transaction = null;
      for (let attempts = 0; attempts < maxAttempts; attempts++) {

        log("trying...", attempts);
        
        transaction = await connection.getTransaction(txnSignature, {
          maxSupportedTransactionVersion: 1,
        });

        if (transaction) {
          break; // Exit the loop if the transaction is found
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
      }

      // If the transaction is still not found, return an error
      if (!transaction) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            fromServer: 'transaction details not found',
            status: "failed",
          }
        );

        error("Transaction not found after maximum attempts.")
        return res.json({
          status: "error",
        });
      }

      // got the txn!!
      log(transaction);

      if (transaction?.meta?.err != null) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            fromServer: 'transaction failed',
            status: "failed",
          }
        );

        error("Transaction failed")
        return res.json({
          status: "error",
        });
      }

      if (
        (transaction?.meta?.postBalances[1] ?? 0) -
          (transaction?.meta?.preBalances[1] ?? 0) !== request.amount
      ) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            fromServer: 'invalid amount sent',
            status: "invalid amount",
          }
        );

        error("Transaction amount or signature is not correct")
        return res.json({
          status: "error",
        });

      }

      if (
        transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
        request.to
      ) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            fromServer: 'transaction to incorrect address',
            status: "invalid transaction",
          }
        );

        error("Transaction to incorrect address")
        return res.json({
          status: "error",
        });

      }

      if (
        transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
        request.from
      ) {
        await databases.updateDocument(
          databaseId,
          transactionCollectionId,
          txnId,
          {
            fromServer: 'transaction from incorrect address',
            status: "invalid transaction",
          }
        );
        
        error("Transaction from incorrect address")
        return res.json({
          status: "error",
        });

      }

      await databases.updateDocument(
        databaseId,
        transactionCollectionId,
        txnId,
        {
          fromServer: 'success verified',
          status: "success verified",
        }
      );

      log("Transaction verified successfully");

    } catch (err) {
      error('Error verifying txn');
    }

    // execution successful try
    return res.json({
      motto: 'Build like a team of hundreds_',
      status: "success"
    });
};