import { useEffect, useState } from "react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
} from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import Toast from "../Toast";

export default function TransactionButtons({
  onClick,
}: {
  onClick: () => void;
}) {
  // for sending txn
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [clickedTransaction, setClickedTransaction] = useState<boolean>(false);
  const [txnDetails, setTxnDetails] = useState<any>(null);
  const [txnResult, setTxnResult] = useState<any>(null);

  async function makePayment() {
    setClickedTransaction(true);
    try {
      if (!publicKey) {
        Toast({ type: "Error", message: "Wallet not connected" });
        throw new Error("Wallet not connected");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(
            "8CfExqnCKsnkfkcwnm2ErSMc7jZJ6KBGXtjrpyqHgujg"
          ),
          lamports: 10000000, // 0.01 SOL
        })
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });

      // make txn entry in db

      await setTxn(signature);
    } catch (error) {
      Toast({ type: "Error", message: "Transaction signing failed" });
      console.error("Transaction Error:", error);
    } finally {
      setClickedTransaction(false);
    }
  }

  const setTxn = async (signatureTxn: any) => {
    try {
      const response = await fetch(`/api/sendtransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txnSignature: signatureTxn,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast({
          type: "Error",
          message: errorData.message || "Failed to make txn entry",
        });
        throw new Error("Failed to make txn entry");
      }
      const data = await response.json();
      console.log("Txn details Data:", data);
      setTxnDetails(data);
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      //   setLoading(false);
    }
  };

  const fetchData = async () => {
    console.log("Fetching..... Txn:", txnDetails.txnSignature);
    // setLoading(true);
    try {
      const response = await fetch(`/api/verifytxn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txnId: txnDetails.txnId,
          txnSignature: txnDetails.txnSignature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setTxnResult(errorData);
        Toast({
          type: "Error",
          message: errorData.message || "Failed to get txn details",
        });
        throw new Error("Failed to get txn details.");
      }
      const data = await response.json();
      console.log("Txn details Data:", data);
      setTxnResult(data);
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      //   setLoading(false);
    }
  };

  useEffect(() => {
    if (txnDetails) {
      fetchData();
    }
  }, [txnDetails]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {txnDetails ? (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          {/* Transaction Signature Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              Transaction Details
            </h2>
            <p className="text-gray-700 break-all">
              <span className="font-medium">Txn Signature:</span>{" "}
              {txnDetails.txnSignature}
            </p>
          </div>

          {/* Transaction Status Section */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Status</h3>
            {txnResult ? (
              <p
                className={`text-lg font-medium ${
                  txnResult.status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {txnResult.status.charAt(0).toUpperCase() +
                  txnResult.status.slice(1)}
              </p>
            ) : (
              <div className="flex items-center">
                {/* Spinner */}
                <div
                  className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"
                  role="status"
                  aria-label="Loading"
                ></div>
                <span className="text-gray-700">Waiting for result...</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-row justify-center items-center">
            <button
              onClick={onClick}
              className="bg-blue-500 text-white hover:bg-blue-600 lex items-center justify-center py-2 px-7 rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={makePayment}
          disabled={clickedTransaction}
          className={`flex items-center justify-center py-3 px-6 rounded-lg font-bold transition duration-300 
        ${
          clickedTransaction
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        } shadow-md`}
        >
          {clickedTransaction ? (
            <>
              {/* Spinner */}
              <div
                className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"
                role="status"
                aria-label="Processing"
              ></div>
              <span>Wait...</span>
            </>
          ) : (
            "Send 0.1 SOL"
          )}
        </button>
      )}
    </div>
  );
}
