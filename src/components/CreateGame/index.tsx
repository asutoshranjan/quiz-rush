"use client";

import { useState } from "react";
import Toast from "../Toast";
import { GridBackgroundDemo } from "../UI/Background";
import Link from "next/link";
import TxnButtons from "./txns"

export default function AddQuestionFlow() {
  const [step, setStep] = useState(1); // Step 1: Create Set, Step 2: Add Questions
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
          <div className="bg-white p-10 rounded-xl shadow-2xl w-full">
            {step === 1 ? (
              <>
                <h1 className="text-4xl font-semibold text-center mb-4 text-gray-800">
                  Create a New Question Set
                </h1>
                <TxnButtons />
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
                <h2 className="text-deep-black font-medium text-lg">New Set : {questionSetData.setTitle} </h2>
                <div className="flex flex-row justify-between items-center mb-4">
                  <div className="font-medium">Questions added: {questions.length}</div>
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
                        <p className="text-red-500 text-sm">{errors.optionA}</p>
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
                        <p className="text-red-500 text-sm">{errors.optionB}</p>
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
                        <p className="text-red-500 text-sm">{errors.optionC}</p>
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
                        <p className="text-red-500 text-sm">{errors.optionD}</p>
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
