"use client";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

function formatPublicKey(publickey: string, offset: number = 4) {
  let key = publickey.trim();
  return key.slice(0, offset) + "..." + key.slice(-offset);
}

export default function LeaderboardCopyablePublicKey({
  publickey,
}: {
  publickey: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    console.log("copying");
    navigator.clipboard.writeText(publickey);
    setCopied(true);
    let timer = setTimeout(() => {
      setCopied(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  };

  function RenderCopy({isCoppied}: {isCoppied: boolean}) {
    if (isCoppied) {
      return (
        <div className="flex flex-row text-xs text-deep-green items-center">
          <div>Copied</div>
          <IconCheck className="h-6 w-5" />
        </div>
      );
    } else {
      return (
        <button onClick={copy}>
          <IconCopy className="h-3 w-3 text-deep-black flex justify-center items-center" />
        </button>
      );
    }
  }
  return (
    <h2 className="flex flex-1 text-sm font-Inter font-medium text-deep-black gap-x-2">
      {formatPublicKey(publickey, 4)}
      <RenderCopy isCoppied={copied} />
    </h2>
  );
}
