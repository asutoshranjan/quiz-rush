"use client";

import { IconUser } from "@tabler/icons-react";
import CopyablePublicKey from "./publicKey";
import CoinValue from "./coins";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import Toast from "../Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Appbar() {
  const [userData, setUserData] = useState<any>(null);
  const [domLoad, setDomLoad] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userDataLoading, setUserDataLoading] = useState(false);

  const [trigger, setTrigger] = useState(false);

  // userId?: string;
  // name?: string;
  // walletPublicKey?: string;

  const fetchUserData = async () => {
    setUserDataLoading(true);
    try {
      const response = await fetch("/api/getuser");

      const data = await response.json();

      if (response.ok) {
        setUserData(data);
      }
      setDomLoad(true);
    } catch (error: any) {
      console.log(error);
    } finally {
      setDomLoad(true);
      setUserDataLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const ConnectWallet = () => {
    const router = useRouter();
    const { publicKey, signMessage } = useWallet();

    const requestLogin = async (reqData?: any) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        const resdata = await response.json();
        console.log("Data:", resdata);
      } catch (err: any) {
        console.log(err);
        Toast({ type: "Error", message: err.message || "Failed to Login" });
      } finally {
        setLoading(false);
      }
    };

    const requestSignature = async (reqData?: any) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/getsignature`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqData),
        });

        if (!response.ok) {
          throw new Error("Failed to get signing message.");
        }

        const resdata = await response.json();
        console.log("Data:", resdata);
        return resdata.signingMessage;
      } catch (err: any) {
        console.log(err);
        Toast({
          type: "Error",
          message: err.message || "Failed to get sigining message",
        });
      } finally {
        setLoading(false);
      }
    };

    const login = async (publicKey: string) => {
      const signingMessage = await requestSignature({
        name: "",
        publickey: publicKey,
      });

      const message = new TextEncoder().encode(signingMessage);
      const signature = await signMessage?.(message);

      console.log("Login:", message, signature);

      await requestLogin({
        publickey: publicKey,
        signature: signature,
      }).then((res) => {
        console.log("Login Response:", res);
        // router.push("/");
        fetchUserData();
      });
    };

    useEffect(() => {
      if (publicKey && domLoad) {
        if (!trigger && userData == null) {
          login(publicKey!.toBase58());
        }
        setTrigger(true);
      }
    }, [publicKey, domLoad, userData]);

    async function logout() {
      try {
        const response = await fetch(`/api/logout`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Logout Response:", data);
          setUserData(null);
          setTrigger(false);
        } else {
          throw new Error("Failed to logout.");
        }
      } catch (err: any) {
        console.log(err);
        Toast({ type: "Error", message: err.message });
      }
    }

    if (publicKey) {
      return (
        <div>
          <button
            onClick={() => {
              logout();
            }}
          >
            <WalletDisconnectButton />
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <WalletMultiButton />
        </div>
      );
    }
  };

  return (
    <div className="flex flex-row w-full z-50 justify-between px-10 pt-5 mb-5 items-center relative">
      {loading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 z-[1000] border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <div className="flex flex-row justify-center items-center">
        <CoinValue
          value={userData != null && userData.points ? userData.points : ""}
        />
        <Link href={`/user`} className="ml-3 mr-1">
          <IconUser className="h-8 w-8 text-deep-black flex justify-center items-center" />
        </Link>
        {!userDataLoading ? (
          <div>
            {userData === null ? (
              <div>
                <h2 className="flex flex-1 text-[0.68rem] font-Inter font-semibold text-red-700">
                  Not Signed
                </h2>
                <div className="flex flex-row gap-x-1 items-center">
                  <h2 className="flex flex-1 text-[0.855rem] font-Inter font-medium text-deep-black">
                    Connect Wallet
                  </h2>
                  <IconArrowRight className="h-[0.93rem] w-[0.93rem] text-deep-black flex justify-center items-center" />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="flex flex-1 text-[0.89rem] font-Inter font-semibold text-deep-black">
                  {userData.name}
                </h2>
                <CopyablePublicKey publickey={userData.walletPublicKey} />
              </div>
            )}
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-t-transparent border-violet-600 rounded-full animate-spin" />
        )}
      </div>

      <ConnectWallet />
    </div>
  );
}
