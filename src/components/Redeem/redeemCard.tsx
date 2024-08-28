"use client";
import { useState, useEffect } from "react";
import Toast from "../Toast";
import CopyablePublicKey from "../Appbar/publicKey";
import {IconUser, IconCopy} from "@tabler/icons-react";
import PointsToSol from "../UI/PontsToSol";

import coinImg from "../../../public/coin.png";
import ethImage from "../../../public/eth.png";
import Image from "next/image";
import { IconArrowsExchange2 } from "@tabler/icons-react";

export default function RedeemCard() {
  const [data, setData] = useState<any>();
  const [ payoutData, setPayoutData ] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
  }, [payoutData]);


  const requestPayout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setPayoutData(errorData);
        Toast({
          type: "Error",
          message: errorData.message || "Failed to payout",
        });
        throw new Error("Failed to payout.");
      }
      const data = await response.json();
      console.log("Payout Txn Data:", data);
        setPayoutData(data);
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };



  function PointsToSolRedeem({ points }: { points: number}) {
    return (
      <div className="mt-5 z-10">
        <div className="flex flex-row text-xl font-semibold font-Inter justify-center items-center">
          <Image src={coinImg} alt="logo" className="h-12 w-11 mr-3" />
          <div>{points}</div>
  
          <div className="flex flex-row items-center space-x-1 mx-3">
            <IconArrowsExchange2 className="h-6 w-6 text-gray-600" />
          </div>
  
          <div>{(points * 0.00001).toFixed(5)}</div>
  
          <div>
            <Image src={ethImage} alt="logo" className="h-11 w-11 ml-3" />
          </div>
        </div>

        {/* txnId: newTxnId,
          txnSignature: signature,
          success: true,
          status: */}


          <div className="flex flex-row justify-center items-center">
          <div className="my-5 text-deep-black font-medium">
          Swap can be done for amounts more than 0.01 SOL
        </div>
          </div>
  
        
        <div className="flex flex-col items-center justify-center p-4 max-w-full">
      <div className="flex flex-col items-center justify-center">
        {payoutData ? (
          payoutData.status == "failed" ? (
            <div className="text-center">
              <p className="text-red-600 font-semibold text-xl">Payout Failed</p>
              <p className="text-gray-600 mt-2">
                Please try again or contact support.
              </p>
            </div>
          ) : (
            <div className="text-left">
              <p className="text-green-600 font-semibold text-lg mb-2">
                Payout Successful
              </p>
              <div className="space-y-1">
                <p className="text-gray-800">
                  <span className="font-medium">Txn Signature:</span>{" "}
                  <span className="break-all">{payoutData.txnSignature}</span>
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Amount:</span> {payoutData.value} SOL
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Status:</span> {payoutData.status}
                </p>
              </div>
            </div>
          )
        ) : (
          <button
            onClick={requestPayout}
            disabled={loading}
            className={`font-Yeseva text-xl font-medium text-deep-black rounded-2xl px-6 py-2 tracking-wide border-2 border-deep-black 
            ${
              loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "text-deep-black hover:bg-light-yellow"
            } shadow-md border-2 border-black`}
          >
            {loading ? (
              <>
              <div className="flex flex-row">
                <div
                  className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mr-3"
                  role="status"
                  aria-label="Processing"
                ></div>
                <span>Processing...</span>
                </div>
              </>
            ) : (
              "Withdraw"
            )}
          </button>
        )}
      </div>
    </div>
      </div>
    );
  }

  if (!data) {
    return ( 
        <div className="flex min-h-80 items-center space-x-4">
        </div>
    );
  } else {

    return (
        <div className="md:w-2/3 mx-6 md:mx-auto mt-16 p-6 bg-gradient-to-r from-green-50 to-blue-100 border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="flex flex-col justify-center z-10">
          
          <div className="flex flex-col flex-1">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {/* Placeholder for user profile picture */}
              <IconUser className="h-14 w-14 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
              <p className="text-sm text-gray-600">{""}</p>
              <CopyablePublicKey publickey={data.walletPublicKey || ""} />
            </div>
          </div>
          
          </div>

          <div className="flex flex-col flex-1 justify-center items-center">
          <div className="mt-6  flex flex-col justify-center items-center">
            <p className="text-gray-800 font-Inter text-2xl font-semibold">Total Points</p>
            <p className="text-light-blue text-2xl font-bold mb-4">{data.points}</p>
          </div>
            <PointsToSolRedeem points={data.points} />
          </div>
          </div>
        </div>
      );
  }
}



