import { useEffect, useState, useRef } from 'react';
import Toast from '../Toast';
import ScoreCard from '../ScoreCard';
import LottieComponent from "../UI/LottieComponent";
import Timer from "../../../public/timer-up-down.json";

interface Question {
  title: string;
  answer: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  type: 'mcq' | 'type';
  questionId: string;
}

const Countdown = ({ onTimeUp, loading, submitData }: { onTimeUp: () => void, loading: boolean, submitData: any }) => {
  const [timer, setTimer] = useState(40);
  const [ stop, setStop ] = useState(false);

  useEffect(() => {
    if (timer > 0 && !loading && !submitData) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      if (timer === 0  && !loading && !submitData){
      onTimeUp(); // Notify the parent component when time is up
      }
      setStop(true);
    }
  }, [timer]);

  return (
    <div className='flex flex-row justify-end items-center pr-4 translate-y-14'>
      <LottieComponent animationData={Timer} loop={ !stop } className="flex justify-center items-center w-16" />
    <h1 className="text-2xl font-semibold text-red-500/80">{timer} s</h1>
    </div>
  );
};

const QuizForm = ({ 
  questions, 
  userAnswers, 
  setUserAnswers, 
  onSubmit 
}: { 
  questions: Question[], 
  userAnswers: Record<string, string>, 
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  onSubmit: () => void 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.questionId]: event.target.value,
    });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const handleClearSelection = () => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.questionId]: '',
    });
  };
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentQuestion.type === 'type' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  return (
    <div>
      <div className="bg-white shadow-lg rounded-md px-4 py-3 mb-2">
        <div className="font-Inter flex flex-row justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-500">
            Question {currentQuestionIndex + 1} / {questions.length}
          </h1>
        </div>
      </div>

      <div className="quiz-container mx-auto p-6 bg-white shadow-lg rounded-md">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">{currentQuestion.title}</h2>

        {currentQuestion.type === 'mcq' ? (
          <div className="options space-y-4">
            {[currentQuestion.optionA, currentQuestion.optionB, currentQuestion.optionC, currentQuestion.optionD].map(
              (option, index) => (
                <label key={index} className="block p-3 border rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input
                    type="radio"
                    className="mr-2"
                    name={`question-${currentQuestion.questionId}`}
                    value={option || ''}
                    checked={userAnswers[currentQuestion.questionId] === option}
                    onChange={handleAnswerChange}
                  />
                  {option}
                </label>
              )
            )}
          </div>
        ) : (
          <div className="mb-6">
            <label className="block mb-2 text-lg font-medium">Your Answer:</label>
            <input
              ref={inputRef}
              type="text"
              className="w-full p-3 border rounded-md"
              value={userAnswers[currentQuestion.questionId] || ''}
              onChange={handleAnswerChange}
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-x-4">
          {currentQuestionIndex > 0 && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              onClick={handlePreviousQuestion}
            >
              Previous
            </button>
          )}

          {userAnswers[currentQuestion.questionId] && (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          )}

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleNextQuestion}
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={onSubmit}
              type="submit"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Quiz = ({ questions, sessionId,}: { questions: Question[], sessionId: string,}) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitData, setSubmitData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    questions.forEach((question) => {
      initialAnswers[question.questionId] = '';  // Set default to empty string for each question
    });
    setUserAnswers(initialAnswers);
  }, [questions]);

  const fetchData = async (reqData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast({ type: "Error", message: errorData.message || "Failed to submit" });
        throw new Error("Failed to submit.");
      }

      const data = await response.json();
      console.log("Data:", data);
      setSubmitData(data);

      Toast({ type: `${data.pointsGiven} Points`, message: `Added from this game!` });
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    const reqData = {
      quizSession: sessionId,
      userAnswer: Object.values(userAnswers),
    };
    fetchData(reqData);
  };

  const handleTimeUp = () => {
    handleFormSubmit(); // Submit the form when the timer runs out
  };

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}

      {submitData ? (
        <ScoreCard data={submitData} />
      ) : (
        <div className='-translate-y-7'>
          <Countdown onTimeUp={handleTimeUp} loading={loading} submitData={submitData} />
          <QuizForm 
            questions={questions} 
            userAnswers={userAnswers} 
            setUserAnswers={setUserAnswers} 
            onSubmit={handleFormSubmit} 
          />
        </div>
      )}
    </div>
  );
};

export default function QuizPage({ questionsData, session, }: { questionsData: any, session: string}) {
  return <Quiz questions={questionsData} sessionId={session}/>;
}
