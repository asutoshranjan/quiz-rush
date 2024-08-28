import {logout } from "../../auth-utils";
import { redirect } from "next/navigation";
import {IconUser, IconCopy} from "@tabler/icons-react";
import CopyablePublicKey from "./publicKey";
import CoinValue from "./coins";
import Link from "next/link";
import ConnectWallet from "../ConnectWallet";


function formatPublicKey(publickey: string, offset: number = 4) {
    let key = publickey.trim();
    return key.slice(0, offset) + "..." + key.slice(-offset);
}

export default function Appbar({name, publickey, }: {name: string, publickey: string,}) {

    // const handleDisconnect = async () => {
    //     "use server";
    //     await logout();
    //     redirect("/login");
    //   };

    return (
        <div className="flex flex-row w-full z-10 justify-between px-10 pt-5 mb-5 items-center">
            <div className="flex flex-row justify-center items-center">
              <CoinValue />
              <Link href={`/user`} className="ml-3">
              <IconUser className="h-8 w-8 text-deep-black flex justify-center items-center" />
              </Link>
            
            <div>
                <h2 className="flex flex-1 text-base font-Inter font-semibold text-deep-black">{name}</h2>
                <CopyablePublicKey publickey={publickey} />
            </div>
            
            </div>
            
            {/* <form action={handleDisconnect}>
            <button
              type="submit"
              className="rounded-xl py-2 px-2 text-base md:text-lg font-Inter text-deep-black font-semibold border-2 border-deep-black hover:bg-deep-green hover:text-light-white"
            >
              <ConnectWallet />
            </button>
          </form> */}
          <ConnectWallet session={publickey ?? ""} />
        </div>
    );
}