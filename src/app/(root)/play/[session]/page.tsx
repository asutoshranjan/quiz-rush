"use client";
import { useEffect, useState } from "react";
import { GridBackgroundDemo } from "../../../../components/UI/Background";
import { useParams, useSearchParams } from "next/navigation";
import QuizPage from "../../../../components/Quiz";
import Toast from "../../../../components/Toast";
import ScoreCardPage from "../../../../components/UI/MainScoreCard";

export default function PlayPage() {
  const searchParams = useSearchParams();
  const params = useParams();

  const quizSession = params.session as string;

  const [gameData, setGameData] = useState<any>(null);
  const [quizSessionData, setQuizSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/startgame`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizSession: quizSession,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast({ type: "Error", message: errorData.message || "Failed to start game" });
        throw new Error("Failed to get game session.");
      }
      const data = await response.json();
      console.log("Data:", data);
      setGameData(data.questions);
    } catch (err : any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const startClick = async () => {
    await fetchData();
  };


  const fetchSessionDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessiondetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizSession: quizSession,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast({ type: "Error", message: errorData.message || "Failed to get game session details" });
        throw new Error("Failed to get game session details.");
      }

      const data = await response.json();
      console.log("Session details Data:", data);
      setQuizSessionData(data);

    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchSessionDetails();
  }, []);


  function RenderQuizOrResultForSession() {
    if (quizSessionData) {

      if (quizSessionData.quizEnded) {
        return (
          <div className="w-full px-6 md:px-0 md:w-2/3 z-10 justify-start flex min-h-screen flex-col items-center py-10">
            <ScoreCardPage data={quizSessionData} />
          </div>
        );
      } else {
        return (
          <div className="w-full md:w-2/3 z-10 justify-start flex min-h-screen flex-col items-center py-10">
        <h1 className="text-3xl text-black/80 font-bold text-center mb-4">
          Playing: {quizSessionData.setTitle}
        </h1>
        <div>
          <h1 className="text-xl text-black/70 font-semibold text-center mb-1">
            Session: {quizSessionData.sessionId}
          </h1>
        </div>

        {gameData ? (
          <div className="w-full px-2 ">
            <QuizPage
              questionsData={gameData}
              session={quizSession}
            />
          </div>
        ) : quizSessionData.invalid ? (
          <div className="text-lg text-red-800 font-Inter font-semibold text-center mt-8">
            {quizSessionData.message}
          </div>
        ) : (
          <div className="h-20 flex flex-col justify-center">
            <button
              onClick={startClick}
              className="bg-deep-black hover:bg-red-700 text-white font-bold py-3 px-5 tracking-wide rounded-md"
            >
              Start Game
            </button>
          </div>
        )}
      </div>
        );
      }
    } else {
      return (
        <div></div>
      );
  }}

  return ( 
    <GridBackgroundDemo >
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div> 
      )}

      <RenderQuizOrResultForSession />
      
    </GridBackgroundDemo>
  );
}

