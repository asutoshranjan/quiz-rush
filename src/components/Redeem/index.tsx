"use client";

import PayoutHistory from "./payoutHistory";
import RedeemCard from "./redeemCard";

import { useState, useEffect, use } from "react";
import Toast from "../Toast";

export default function Redeem() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const fetchPayOut = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch("/api/payouthistory");
      const data = await response.json();
      setData(data);
    } catch (error: any) {
      console.log(error);
      Toast({
        type: "Error",
        message: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false); // Stop loading after data fetch
    }
  };

  const [dataU, setDataU] = useState<any>();
  const [payoutData, setPayoutData] = useState<any>(null);
  const [loadingU, setLoadingU] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/getuser");
      const resData = await response.json();
      setDataU(resData);
    } catch (error: any) {
      console.log(error);
      Toast({
        type: "Error",
        message: error.message || "Something went wrong",
      });
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPayOut();
  }, [payoutData]);

  const requestPayout = async () => {
    setLoadingU(true);
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
      setLoadingU(false);
    }
  };

  return (
    <div>
      {loadingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <RedeemCard
        data={dataU}
        payoutData={payoutData}
        loading={loadingU}
        requestPayout={requestPayout}
      />
      <PayoutHistory loading={loading} data={data} />
    </div>
  );
}
