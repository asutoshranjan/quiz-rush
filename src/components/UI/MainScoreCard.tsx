import React from "react";

interface ScoreCardProps {
  setTitle: string;
  sessionId: string;
  answers: string[];
  pointsGiven: number;
  correctAnswers: string[];
  questions: string[];
  endTime: string;
  time: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  setTitle,
  sessionId,
  answers,
  pointsGiven,
  correctAnswers,
  questions,
  endTime,
  time,
}) => {
  return (
    <div className="w-full md:w-4/5 p-6 bg-white shadow-md rounded-lg mx-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Score Card</h2>

      <div className="mb-6">
        <h3 className="font-medium text-xl text-gray-800 mb-1">
          {setTitle}
        </h3>
        <h3 className="text-sm font-medium text-gray-700">
          Session ID: {sessionId}
        </h3>
        <p className="text-sm text-gray-600">
          End Time: {new Date(endTime).toLocaleString()}
        </p>
        <p className="text-sm font-medium text-gray-600">Time Taken: {time}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          Total Score: {pointsGiven}
        </h3>

        {questions.map((question, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-medium text-gray-800">
              {index + 1}. {question}
            </h4>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Your Answer:</span>{" "}
              {answers[index]}
            </p>
            <p
              className={`text-sm ${
                answers[index].trim().toLowerCase() ===
                correctAnswers[index].trim().toLowerCase()
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              <span className="font-semibold">Correct Answer:</span>{" "}
              {correctAnswers[index]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ScoreCardPage({ data }: { data: any }) {
  return <ScoreCard {...data} />;
}
