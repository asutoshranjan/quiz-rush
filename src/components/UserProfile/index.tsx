"use client";
import { useState, useEffect } from "react";
import Toast from "../Toast";
import CopyablePublicKey from "../Appbar/publicKey";
import {IconUser, IconCopy} from "@tabler/icons-react";
import PointsToSol from "../UI/PontsToSol";

export default function UserProfile() {
  const [data, setData] = useState<any>();

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/getuser");
      const resData = await response.json();
      setData(resData);
    } catch (error: any) {
      console.log(error);
      Toast({
        type: "Error",
        message: error.message || "Something went wrong",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!data) {
    return ( 
        <div className="flex min-h-80 items-center space-x-4">
        </div>
    );
  } else {

    return (
        <div className="md:w-2/3 mx-6 md:mx-auto p-6  bg-gradient-to-r from-green-50 to-blue-100 border-gray-200 rounded-lg shadow-lg z-10">
          <div className="flex flex-col md:flex-row justify-center">          
          <div className="flex flex-col flex-1">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <IconUser className="h-14 w-14 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
              <p className="text-sm text-gray-600">{""}</p>
              <CopyablePublicKey publickey={data.walletPublicKey || ""} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-800 font-semibold">Total Points:</p>
            <p className="text-gray-600 mb-4">{data.points}</p>
            <p className="text-gray-800 font-semibold">Average Answer Time:</p>
            <p className="text-gray-600 mb-4">{data.avgAnswerTime} seconds</p>
            <p className="text-gray-800 font-semibold">Number of Quiz Attempt:</p>
            <p className="text-gray-600 mb-4">{ data.quizSessions ? data.quizSessions.length : ""}</p>
            <p className="text-gray-800 font-semibold">Conversion</p>
            <p className="text-gray-600">{"1000 Points is 0.01 SOL"}</p>
          </div>
          </div>

          <div className="flex flex-col flex-1 justify-center items-center">
            <PointsToSol points={data.points} />
          </div>
          </div>
        </div>
      );
  }
}
