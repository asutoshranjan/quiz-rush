"use client";

import { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Toast from "../Toast";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { publicKey, signMessage } = useWallet();
  const router = useRouter();
  const [intiLogin, setInitLogin] = useState(true);

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
        Toast({ type: "Error", message: "Failed to Login" });
        throw new Error("Failed to Login.");
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
        Toast({ type: "Error", message: "Failed to get signing message" });
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

  // login function
  const login = async (publicKey: string) => {
    // get and sign the message
    try {
      setInitLogin(false);
      const signingMessage = await requestSignature({
        name: name,
        publickey: publicKey,
      });

      const message = new TextEncoder().encode(signingMessage);
      const signature = await signMessage?.(message);

      console.log("Signature:", signature);

      // verify the signature with public key on server and login the user
      await requestLogin({
        publickey: publicKey,
        signature: signature,
      }).then((res) => {
        console.log("Login Response:", res);
        router.push("/");
      });
    } catch (err) {
      console.log(err);
      setInitLogin(true);
    }
  };

  useEffect(() => {
    if (publicKey) {
      console.log("Public Key:", publicKey.toBytes());
      // perform login
      if (intiLogin) {
      login(publicKey.toBase58());
      }
    }
  }, [publicKey]);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <div className="flex flex-col justify-start">
        <input
          name="name"
          className="rounded-md p-2 text-xl font-Inter font-semibold bg-white"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <h1 className="text-xs font-Inter flex-1 pl-1 text-black/70">
          *Player name if its your first time
        </h1>
      </div>
      <div className="mt-5">
        <WalletMultiButton />
      </div>
    </div>
  );
}
