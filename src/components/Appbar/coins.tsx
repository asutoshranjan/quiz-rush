"use client";

import { useState, useEffect } from "react";
import coinImg from "../../../public/coin.png";
import Image from "next/image";
import Toast from "../Toast";

export default function CoinValue() {
  const [userData, setData] = useState<any>();

  useEffect(() => {
    const fetchCoinValue = async () => {
      try {
        const response = await fetch("/api/getuser");
        const data = await response.json();
        setData(data);
      } catch (error: any) {
        console.log(error);
        Toast({
          type: "Error",
          message: error.message || "Something went wrong",
        });
      }
    };
    fetchCoinValue();
  }, []);

  if (!userData) {
    return (
      <div>
        <div className="bg-light-yellow flex flex-row px-2 py-1 rounded-md items-center">
          <Image src={coinImg} alt="logo" className="h-7 w-6 mr-1" />
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin">
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="bg-light-yellow flex flex-row px-2 py-1 rounded-md">
          <Image src={coinImg} alt="logo" className="h-7 w-6 mr-1" />
          <div className="text-lg font-Inter font-bold text-deep-black">
            {userData.points}
          </div>
        </div>
      </div>
    );
  }
}
