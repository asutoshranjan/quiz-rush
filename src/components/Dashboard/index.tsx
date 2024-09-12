import { getSession, logout } from "../../auth-utils";
import Button from "../Button";
import { GridBackgroundDemo } from "../UI/Background";
import { AppleCards } from "../UI/AppleCards";
import LottieComponent from "../UI/LottieComponent";
import Timer from "../../../public/timer.json";
import Reveal from "../UI/RevealComponent";
import Appbar from "../Appbar";
import LeaderboardCard from "../UI/LeaderboardCard";
import Link from "next/link";
import { ShimmerButton } from "../UI/ButtonStyles";
import { IconBrandGithub } from "@tabler/icons-react";
import Play from "../../../public/play.json";
import CupP from "../../../public/cup.png";
import Image from "next/image";
import LeaderBoard from "./leaderBoard";
import solanaImg from "../../../public/solana.png";

export function Lable() {
  return (
    <div className="z-10 flex flex-row py-2 px-4 bg-light-yellow rounded-3xl items-center gap-1">
      <LottieComponent
        animationData={Timer}
        loop={true}
        className="flex justify-center items-center w-6"
      />
      <h3 className="text-l font-Inter text-gray-800 font-bold ">
        Your Every Answer Counts
      </h3>
    </div>
  );
}

export default async function DashBoard() {
  const session = await getSession();

  console.log(session);

  return (
    <GridBackgroundDemo>
      <div className="flex min-h-screen w-full flex-col items-center justify-between">
        <Appbar />
        <div className="flex flex-col justify-center items-center gap-4">
          <h2 className="text-5xl z-10 font-Yeseva tracking-wide text-red-700/75">
            QuizRush
          </h2>

          <Reveal>
            <Lable />
          </Reveal>
        </div>

        <AppleCards />

        <div className="flex flex-col gap-y-8 justify-center items-center">
          <Link href={"/play"}>
            <Button
              text="Play Quiz"
              onClick={undefined}
              className="font-Yeseva text-xl font-medium bg-deep-black hover:bg-deep-green text-light-white rounded-2xl px-11 py-3 tracking-wide"
            />
          </Link>
        </div>

        <div className="flex flex-col items-center md:flex-row md:items-start w-full justify-evenly z-10 px-10 gap-x-5 py-10 md:py-2 mb-14">
          <div className="">
            <h2 className="z-10 font-Yeseva text-deep-black text-2xl md:text-4xl">
              Pick A Card
            </h2>
            <h2 className="z-10 font-Yeseva text-deep-black text-2xl md:text-4xl mt-1 md:mt-3">
              And Start Playing Quiz
            </h2>
            <h2 className="z-10 font-Inter font-semibold text-gray-700/90 text-lg mt-6">
              • Challenge your brain, connect with other quiz lovers.<br></br>
              and cashout solana to your wallet.
            </h2>
            <h2 className="z-10 font-Inter font-semibold text-gray-700/90 text-lg mt-2">
              • Compete with players worldwide in to win tokens<br></br>Race
              against the timer to submit your answers
            </h2>
            <div className="flex flex-row-reverse md:absolute z-10 md:translate-x-80 md:-translate-y-32">
              <Image
                src={CupP}
                alt="Cup"
                height={200}
                width={200}
                className="flex justify-center items-center w-1/2 md:w-4/5"
              />
            </div>
          </div>

          <div className="w-full md:w-2/5 flex flex-col">
            <LeaderBoard />

            <div className="flex flex-row-reverse mt-4 z-10">
              <Link href="/leaderboard">
                <Button
                  text="See Leaderboard"
                  onClick={undefined}
                  className="font-Yeseva text-base font-medium text-deep-black rounded-xl px-5 py-2 tracking-wide border-2 border-deep-black hover:bg-deep-black hover:text-light-white"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center md:flex-row md:items-start w-full justify-evenly z-10 px-10 gap-x-5 gap-y-8 md:gap-y-0 py-10 md:py-2 mb-10">
          <div className="flex flex-col items-center">
            <h2 className="z-10 font-Yeseva text-deep-black text-2xl md:text-4xl">
              {`What's Your Next Move?`}
            </h2>
            <div className="flex flex-row gap-x-4 md:gap-x-7 w-full mt-10 items-center justify-center">
              <Link href={"/redeem"}>
                <Button
                  text="Redeem SOL"
                  onClick={undefined}
                  className="font-Yeseva text-xl font-medium text-deep-black rounded-2xl px-6 py-2 tracking-wide border-2 border-deep-black hover:bg-light-yellow"
                />
              </Link>

              <Link href={"/creategame"}>
                <ShimmerButton>
                  <h1 className="font-Yeseva text-xl tracking-wide">
                    Create Game
                  </h1>
                </ShimmerButton>
              </Link>
            </div>
            <LottieComponent
              animationData={Play}
              loop={true}
              className="flex justify-center items-center w-4/5 md:w-96"
            />
          </div>
          <div className="z-10">
            <h2 className="z-10 font-Yeseva text-deep-black text-2xl md:text-4xl">
              Lets Create A New Quiz
            </h2>
            <h2 className="z-10 font-Yeseva text-deep-black text-2xl md:text-3xl mt-1 md:mt-3">
              Lead the Pack. Find the Best
            </h2>
            <h2 className="z-10 font-Inter font-semibold text-gray-700/90 text-lg mt-6">
              • Create a unique challenge and set your quiz.<br></br>choose the
              categories, set the questions. In your way.
            </h2>
            <h2 className="z-10 font-Inter font-semibold text-gray-700/90 text-lg mt-2">
              • Track participants, and see who rises to the top.<br></br>The
              quizmaster is you, the world is ready to play
            </h2>
            <div className="flex flex-row-reverse md:absolute z-10 md:translate-x-40 md:-translate-y-32"></div>
          </div>
        </div>

        <div className="w-full z-10 mb-4 mt-2 flex flex-col justify-center items-center">
          <iframe
            className="w-4/5 md:w-1/2 aspect-video md:min-h-96"
            src="https://www.youtube.com/embed/Ky4W112GfXg?si=1QV7y6vzOS2SCo8P"
            title="Product Overview Video"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-row z-10 gap-x-3 font-Inter font-medium mb-4 mt-14">
          <h2 className="text-light-blue font-semibold">100x.devs</h2>
          <h2 className="text-gray-700/70">•</h2>
          <div className="flex flex-row gap-x-1">
            <h2 className="text-black/75">Build by Asutosh</h2>
            <Link href={"https://github.com/asutoshranjan"}>
              <IconBrandGithub size={22} />
            </Link>
          </div>
        </div>
        <Image src={solanaImg} alt="solana" className="w-1/6 mb-6" />
      </div>
    </GridBackgroundDemo>
  );
}
