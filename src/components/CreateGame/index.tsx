"use client";

import { useState, useEffect, use } from "react";
import Toast from "../Toast";
import { GridBackgroundDemo } from "../UI/Background";
import Link from "next/link";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { client, databaseID, collectionID } from "../../lib/appwrite-utils";

export default function AddQuestionFlow() {
  const [step, setStep] = useState(0); // Step 1: Create Set, Step 2: Add Questions
  const [questionSetData, setQuestionSetData] = useState({
    setId: "",
    setTitle: "",
    imageUrl: "",
    questionIds: [],
    approved: false,
  });
  const [questions, setQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    answer: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    type: "mcq", // default type
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // for sending txn
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [clickedTransaction, setClickedTransaction] = useState<boolean>(false);
  const [txnDetails, setTxnDetails] = useState<any>(null);
  const [txnResult, setTxnResult] = useState<any>(null);

  // Handle Question Set Creation
  const handleSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionSetData({
      ...questionSetData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateSetForm = () => {
    let newErrors: any = {};
    if (!questionSetData.setTitle)
      newErrors.setTitle = "Set title is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createQuestionSet = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/createquestionset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionSetData),
      });

      if (!response.ok) throw new Error("Failed to create question set.");

      const data = await response.json();
      setQuestionSetData({
        ...questionSetData,
        setId: data.setId,
      });

      setStep(2); // Move to Step 2: Add Questions
      Toast({ type: "Success", message: "Question set created successfully" });
    } catch (err) {
      console.log(err);
      Toast({ type: "Error", message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSetForm()) {
      createQuestionSet();
    }
  };

  // Handle Question Addition
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    let newErrors: any = {};

    if (!formData.title) newErrors.title = "Question title is required.";
    if (!formData.answer) newErrors.answer = "Answer is required.";

    if (formData.type === "mcq") {
      if (!formData.optionA) newErrors.optionA = "Option A is required.";
      if (!formData.optionB) newErrors.optionB = "Option B is required.";
      if (!formData.optionC) newErrors.optionC = "Option C is required.";
      if (!formData.optionD) newErrors.optionD = "Option D is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchData = async (questionData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/addquestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...questionData, setId: questionSetData.setId }),
      });

      if (!response.ok) throw new Error("Failed to add question.");

      const data = await response.json();
      setQuestions([...questions, data.questionId]);
      Toast({ type: "Success", message: "Question added successfully" });

      setFormData({
        title: "",
        answer: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        type: "mcq",
      });

      // if (questions.length + 1 >= 2) finalizeQuestionSet();
    } catch (err) {
      Toast({ type: "Error", message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      fetchData(formData);
    }
  };

  const finalizeQuestionSet = async () => {
    console.log(questions);
    console.log(questionSetData);
    try {
      setLoading(true);
      const response = await fetch(`/api/savequestionset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          setId: questionSetData.setId,
          questions: questions,
          txnId: txnDetails.txnId,
        }),
      });

      if (!response.ok) throw new Error("Failed to finalize question set");

      setDone(true);

      Toast({ type: "Success", message: "Question set finalized" });
    } catch (error) {
      Toast({ type: "Error", message: "Failed to finalize question set" });
    } finally {
      setLoading(false);
    }
  };

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

  // txn entry in db
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

  function capitalizeFirstLetter(value: string) {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // after db entry this is waht we get in response

  const fetchLastTxn = async () => {
    setLoading(true);

    const response = await fetch(`/api/lasttrans`);
    const data = await response.json();
    setLoading(false);

    console.log("Last Txn Data:", data);

    if (data.data) {
      setTxnDetails(data);
    }
  };

  useEffect(() => {
    fetchLastTxn();
  }, []);

  const clickRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clicksettle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txnId: txnDetails.txnId,
        }),
      });
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const payAgain = async () => {
    await clickRequest();
    // request clicked
    setTxnDetails(null);
    setTxnResult(null);
  };

  const bttnClick = async () => {
    await clickRequest();
    // request clicked
    setStep(1);
  };

  const getTransaction = async () => {
    const response = await fetch(`/api/lasttrans`);
    const data = await response.json();

    console.log("New Txn:", data);

    if (data.data) {
      setTxnDetails(data);
    }
  };

  useEffect(() => {
    // Check if txnDetails is not null before proceeding
    if (!txnDetails) {
      console.log("txnDetails is null, skipping subscription");
      return;
    }

    if (txnDetails.status) {
      setTxnResult(txnDetails);
    } else {
      getTransaction();
    }

    // Subscribe to the transaction
    console.log("Subscribing to txn");

    // appwrite realtime subscription
    const unsubscribe = client.subscribe(
      [
        `databases.${databaseID}.collections.${collectionID}.documents.${txnDetails.txnId}`,
      ],
      (response) => {
        // Callback will be executed on update for the document
        console.log(response);
        setTxnResult(response.payload);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [txnDetails]);

  // now we subscribe to the transaction via appwrite realtime and listen for the txn status
  // once the txn is successful we move to the next step

  const TxnButtonPage = ({ onClk }: { onClk: () => void }) => {
    return (
      <div className="flex flex-col items-center justify-start p-2 min-h-80">
        <div className="text-xl md:text-3xl font-Yeseva tracking-wide mb-2">
          Pay and Launch New Game
        </div>
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
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Status
              </h3>
              {txnResult ? (
                <div className="flex flex-row">
                  <div
                    className={`text-lg text-white flex flex-row items-center p-2 px-5 rounded-md font-medium ${
                      txnResult.status === "success verified"
                        ? "bg-green-600"
                        : txnResult.status === "created"
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  >
                    {txnResult.status === "created" ? (
                      <div
                        className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-200 mr-3"
                        role="status"
                        aria-label="Loading"
                      ></div>
                    ) : (
                      <div></div>
                    )}

                    <div>{capitalizeFirstLetter(txnResult.status)}</div>
                  </div>
                </div>
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
              {txnResult && txnResult.status === "success verified" ? (
                <button
                  onClick={onClk}
                  className="bg-blue-500 text-white hover:bg-blue-600 lex items-center justify-center py-2 px-7 rounded-lg font-bold"
                >
                  Next
                </button>
              ) : txnResult && txnResult.status === "created" ? (
                <></>
              ) : txnResult ? (
                <button
                  onClick={() => {
                    payAgain();
                  }}
                  className="bg-red-500 text-white hover:bg-blue-400 lex items-center justify-center py-2 px-7 rounded-lg font-bold"
                >
                  Pay Again
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={makePayment}
            disabled={clickedTransaction}
            className={`flex items-center justify-center mt-14 py-3 px-6 rounded-lg font-bold transition duration-300 
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
              "Send 0.01 SOL"
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <GridBackgroundDemo>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}

      {done ? (
        <div className="flex flex-col justify-center items-center z-10">
          <h1 className="text-3xl font-semibold text-center mb-1 text-gray-800">
            Question Set Created Successfully!
          </h1>
          <h2 className="text-lg font-Inter font-medium text-gray-600 text-center mb-4">
            The Admin will review the question set and approve it.
          </h2>
          <Link href={`/`}>
            <button className="bg-light-blue px-6 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300">
              Go Back
            </button>
          </Link>
        </div>
      ) : (
        <div className="py-8 z-10 md:w-2/3">
          <div className="bg-gradient-to-r from-blue-100 to-tea-green p-10 rounded-xl shadow-2xl w-full">
            {step === 0 ? (
              <div className="">
                <TxnButtonPage
                  onClk={() => {
                    bttnClick();
                  }}
                />
              </div>
            ) : step === 1 ? (
              <>
                <h1 className="text-4xl font-semibold text-center mb-4 text-gray-800">
                  Create a New Question Set
                </h1>

                <form onSubmit={handleSetSubmit} className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700">
                      Set Title
                    </label>
                    <input
                      type="text"
                      name="setTitle"
                      value={questionSetData.setTitle}
                      onChange={handleSetChange}
                      placeholder="Enter the set title"
                      className={`mt-2 w-full px-4 py-2 border ${
                        errors.setTitle ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.setTitle && (
                      <p className="text-red-500 text-sm">{errors.setTitle}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700">
                      Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={questionSetData.imageUrl}
                      onChange={handleSetChange}
                      placeholder="Enter the image URL"
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-light-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Question Set"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800">
                  Add Questions to Set
                </h1>
                <h2 className="text-deep-black font-medium text-lg">
                  New Set : {questionSetData.setTitle}{" "}
                </h2>
                <div className="flex flex-row justify-between items-center mb-4">
                  <div className="font-medium">
                    Questions added: {questions.length}
                  </div>
                  {questions.length < 8 ? (
                    <div className="text-red-500 text-sm font-medium">
                      You have to add atleast 8 questions
                    </div>
                  ) : (
                    <button
                      onClick={finalizeQuestionSet}
                      className="bg-light-blue text-white py-3 px-5 rounded-lg font-bold hover:bg-blue-600 transition duration-300"
                    >
                      Done
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700">
                      Question Title
                    </label>
                    <textarea
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter the question"
                      rows={4}
                      className={`mt-2 w-full px-4 py-2 border ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    ></textarea>
                    {errors.title && (
                      <p className="text-red-500 text-sm">{errors.title}</p>
                    )}
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="block text-lg font-medium text-gray-700">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      name="answer"
                      value={formData.answer}
                      onChange={handleChange}
                      placeholder="Enter the correct answer"
                      className={`mt-2 w-full px-4 py-2 border ${
                        errors.answer ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.answer && (
                      <p className="text-red-500 text-sm">{errors.answer}</p>
                    )}
                  </div>

                  {/* MCQ Options */}
                  {formData.type === "mcq" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-lg font-medium text-gray-700">
                            Option A
                          </label>
                          <input
                            type="text"
                            name="optionA"
                            value={formData.optionA}
                            onChange={handleChange}
                            placeholder="Enter option A"
                            className={`mt-2 w-full px-4 py-2 border ${
                              errors.optionA
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.optionA && (
                            <p className="text-red-500 text-sm">
                              {errors.optionA}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-lg font-medium text-gray-700">
                            Option B
                          </label>
                          <input
                            type="text"
                            name="optionB"
                            value={formData.optionB}
                            onChange={handleChange}
                            placeholder="Enter option B"
                            className={`mt-2 w-full px-4 py-2 border ${
                              errors.optionB
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.optionB && (
                            <p className="text-red-500 text-sm">
                              {errors.optionB}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-lg font-medium text-gray-700">
                            Option C
                          </label>
                          <input
                            type="text"
                            name="optionC"
                            value={formData.optionC}
                            onChange={handleChange}
                            placeholder="Enter option C"
                            className={`mt-2 w-full px-4 py-2 border ${
                              errors.optionC
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.optionC && (
                            <p className="text-red-500 text-sm">
                              {errors.optionC}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-lg font-medium text-gray-700">
                            Option D
                          </label>
                          <input
                            type="text"
                            name="optionD"
                            value={formData.optionD}
                            onChange={handleChange}
                            placeholder="Enter option D"
                            className={`mt-2 w-full px-4 py-2 border ${
                              errors.optionD
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.optionD && (
                            <p className="text-red-500 text-sm">
                              {errors.optionD}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Question Type */}
                  <div>
                    <label className="block text-lg font-medium text-gray-700">
                      Question Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mcq">MCQ</option>
                      <option value="type">Type</option>
                    </select>
                  </div>

                  {/* Submit Button */}

                  <button
                    type="submit"
                    className="w-full bg-light-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Question"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </GridBackgroundDemo>
  );
}
