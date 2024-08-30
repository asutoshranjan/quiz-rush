"use client";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import Toast from "../Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConnectWallet({ session }: { session: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { publicKey, signMessage } = useWallet();

  const requestLogin = async (reqData?: any) => {
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
    }
  };

  const requestSignature = async (reqData?: any) => {
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
    }
  };

  const login = async (publicKey: string) => {
    // get and sign the message
    const signingMessage = await requestSignature({
      name: "",
      publickey: publicKey,
    });

    const message = new TextEncoder().encode(signingMessage);
    const signature = await signMessage?.(message);

    // 4 request login
    // verify the signature with public key on server and login the user
    await requestLogin({
      publickey: publicKey,
      signature: signature,
    }).then((res) => {
      console.log("Login Response:", res);
      router.push("/");
    });
  };

  useEffect(() => {
    if (publicKey) {
      // perform login if session does not exist
      if (session == "") {
        login(publicKey.toBase58());
      }
    }
  }, [publicKey]);

  async function logout() {
    try {
      const response = await fetch(`/api/logout`, {
        method: "GET",
      });
  
      if (response.ok) {
        console.log("Logout Response:", response);
        // window.location.href = "/login";
        router.push("/login");
      } else {
        // Toast({ type: "Error", message: "Failed to logout" });
        throw new Error("Failed to logout.");
      }
    } catch (err: any) {
      console.log(err);
      Toast({ type: "Error", message: err.message || "Failed to logout" });
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
}
