"use client";

import { useState } from "react";
import { GridBackgroundDemo } from "../../components/UI/Background";
import Toast from "../../components/Toast";

export default function AddQuestionForm() {
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error for the specific field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    let newErrors: any = {};

    if (!formData.title) newErrors.title = "Question title is required.";
    if (!formData.answer) newErrors.answer = "Answer is required.";

    // Validate options if question type is MCQ
    if (formData.type === "mcq") {
      if (!formData.optionA) newErrors.optionA = "Option A is required.";
      if (!formData.optionB) newErrors.optionB = "Option B is required.";
      if (!formData.optionC) newErrors.optionC = "Option C is required.";
      if (!formData.optionD) newErrors.optionD = "Option D is required.";
    }

    setErrors(newErrors);

    // Return whether the form is valid or not
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
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        Toast({ type: "Error", message: "Failed to add question" });
        throw new Error("Failed to add question.");
      }

      const data = await response.json();
      console.log("Data:", data);

      // Clear form data
      setFormData({
        title: "",
        answer: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        type: "mcq",
      });
      Toast({ type: "Success", message: "Question added successfully" });
    } catch (err) {
      console.log(err);
      Toast({ type: "Error", message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const newQuestion = {
        ...formData,
      };
      fetchData(newQuestion);
    }
  };

  return (
    <GridBackgroundDemo>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <div className="py-8 z-10 md:w-2/3 ">
        <div className="bg-white p-10 rounded-xl shadow-2xl w-full">
          <h1 className="text-4xl font-Inter font-semibold text-center mb-4 text-gray-800">
            Add a New Question
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
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
                        errors.optionA ? "border-red-500" : "border-gray-300"
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
                        errors.optionB ? "border-red-500" : "border-gray-300"
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
                        errors.optionC ? "border-red-500" : "border-gray-300"
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
                        errors.optionD ? "border-red-500" : "border-gray-300"
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
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                  <span className="ml-2">Submitting...</span>
                </div>
              ) : (
                "Add Question"
              )}
            </button>
          </form>
        </div>
      </div>
    </GridBackgroundDemo>
  );
}
