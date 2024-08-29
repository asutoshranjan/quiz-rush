import coinImg from "../../../public/coin.png";
import ethImage from "../../../public/eth.png";
import Image from "next/image";
import { IconArrowsExchange2 } from "@tabler/icons-react";
import Button from "../Button";
import Link from "next/link";

export default function PointsToSol({
  points,
  cash,
  onClk,
}: {
  points: number;
  cash?: boolean;
  onClk?: () => void;
}) {
  return (
    <div className="mt-5">
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

      <div className="my-5 text-deep-black font-medium">
        Swap can be done for amounts more than 0.01 SOL
      </div>
      <div className="flex flex-row justify-center mb-5">
        {cash === true ? (
          <button
            onClick={onClk}
            className="font-Yeseva text-xl font-medium text-deep-black rounded-2xl px-6 py-2 tracking-wide border-2 border-deep-black hover:bg-light-yellow"
          >
            {" "}
            Withdraw{" "}
          </button>
        ) : (
          <Link href={"/redeem"}>
            <Button
              text="Redeem SOL"
              onClick={undefined}
              className="font-Yeseva text-xl font-medium text-deep-black rounded-2xl px-6 py-2 tracking-wide border-2 border-deep-black hover:bg-light-yellow"
            />
          </Link>
        )}
      </div>
    </div>
  );
}
