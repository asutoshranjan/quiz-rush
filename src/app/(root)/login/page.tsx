import { redirect } from "next/navigation";
import { login, getSession } from "../../../auth-utils";
import { GridBackgroundDemo } from "../../../components/UI/Background";
import { Lable } from "../../../components/Dashboard";
import Reveal from "../../../components/UI/RevealComponent";
import LottieComponent from "../../../components/UI/LottieComponent";
import Play from "../../../../public/play.json";
import solanaImg from "../../../../public/solana.png";
import LoginForm from "@/components/UI/LoginForm";
import Image from "next/image";
import StepsComponent from "@/components/Steps";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const handleSubmit = async (formData: any) => {
    "use server";
    // await login(formData);
    // redirect("/");
  };

  return (
    <GridBackgroundDemo>
      <main className="flex min-h-screen flex-1 flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col flex-1 justify-evenly items-center md:min-h-screen py-14">
          <h2 className="text-5xl z-10 font-Yeseva tracking-wide text-red-700/75 mb-2">
            QuizRush
          </h2>
          <Reveal>
            <Lable />
          </Reveal>
          <div className="flex flex-col justify-start gap-y-1 w-2/5 mt-4">
            <h2 className="z-10 font-Yeseva text-deep-black text-3xl md:text-5xl">
              {`Let's Play`}
            </h2>
            <h2 className="z-10 font-Yeseva text-deep-black text-3xl md:text-4xl mt-1 md:mt-3">
              The Next Move.
            </h2>
          </div>
          <LottieComponent
            animationData={Play}
            loop={true}
            className="flex justify-center items-center w-4/5 md:w-96"
          />
        </div>
        <div className="flex-1 ">
          <div className="flex flex-col min-h-screen justify-evenly items-center">
            <StepsComponent />
            <div className="flex flex-col items-center">
              <LoginForm />
              <h2 className="z-10 font-Yeseva tracking-wide text-center text-gray-800/80 text-lg mt-6">
                {`Connect Wallet. Let's Go!`}
              </h2>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="font-Inter text-sm font-semibold tracking-wide text-gray-600">
                Powered by
              </div>
              <Image src={solanaImg} alt="solana" className="w-1/4" />
            </div>
          </div>
        </div>
      </main>
    </GridBackgroundDemo>
  );
}
