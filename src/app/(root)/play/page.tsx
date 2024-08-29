"use client";
import { useState, useEffect } from "react";
import { GridBackgroundDemo } from "../../../components/UI/Background";
import Toast from "../../../components/Toast";
import { useRouter } from "next/navigation";

export default function PlayPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState<any>(null);

  const fetchGameSetData = async (reqData?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getquestionsets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast({ type: "Error", message: errorData.message || "Failed to fetch quiz" });
        throw new Error("Failed to fetch quiz.");
      }

      const resdata = await response.json();
      console.log("Data:", resdata);

      // format the data to match the Card main data

      const formatedData = resdata.map((data: any) => {
        return {
          category: data.category,
          title: data.setTitle,
          src: data.imageUrl,
          setId: data.setId,
        };
      });

      console.log("Formated Data:", formatedData);

      setResponse(formatedData);
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Failed to fetch quiz" });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (questionData?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/creategamesession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast({ type: "Error", message: errorData.message || "Failed to create game" });
        throw new Error("Failed to add question.");
      }

      const data = await response.json();
      console.log("Data:", data);

      const sessionId = data.quizSession;

      // Clear form data or redirect to game session
      setLoading(false);

      router.push(`/play/${sessionId}`);

      Toast({ type: "Success", message: `Staring a new game` });
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message ||"Something went wrong" });
      setLoading(false);
    }
  };

  const startNewGame = async (setId: string) => {
    console.log("Starting new game");
    console.log("Set Id:", setId);
    await fetchData({ setId: setId });
  };

  useEffect(() => {
    fetchGameSetData({});
  }, []);

  return (
    <GridBackgroundDemo>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <div className="z-10 p-6 md:p-11 w-full">
        <h1 className="text-4xl text-black/70 font-Inter font-bold text-center mb-8">
          Pick a Game and Play
        </h1>
        <div className="w-full flex-1">
        {response && response.length > 0 ? (
          <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {response.map((card: any, index: number) => (
              <button key={index} onClick={() => {startNewGame(card.setId)}}>
                <Card key={index} card={card} index={index} />
              </button>
            ))}
          </div>
        ) : (
          <div></div>
        )}
        </div>
      </div>
    </GridBackgroundDemo>
  );
}

function Card({ card, index }: { card: any; index: number }) {
  return (
    <div
      key={index}
      className="relative rounded-xl overflow-hidden shadow-lg group aspect-video flex flex-col justify-end cursor-pointer"
      style={{
        backgroundImage: `url(${card.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 p-4 text-white">
        <h1 className="text-xl font-Yeseva font-medium tracking-wide">{card.title}</h1>
        <p className="mt-1 font-Inter text-sm">{card.category}</p>
      </div>
    </div>
  );
}
