import { redirect } from "next/navigation";
import { login, getSession } from "../../../auth-utils";
import { GridBackgroundDemo } from "../../../components/UI/Background";
import { Lable } from "../../../components/Dashboard";
import Reveal from "../../../components/UI/RevealComponent";
import LottieComponent from "../../../components/UI/LottieComponent";
import Play from "../../../../public/play.json";
import ConnectWallet from "../../../components/ConnectWallet";
import LoginForm from "@/components/UI/LoginForm";

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
              Let's Play
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
        <div className="flex flex-col flex-1 justify-between items-center">
          <div className="flex flex-col justify-center items-center">
          <h2 className="text-4xl font-Yeseva mb-4">Welcome</h2>

          {/* <form action={handleSubmit} className="flex flex-col gap-y-10 my-5">
            <input
              name="publickey"
              className="rounded-md p-2 text-xl font-Inter font-semibold bg-white"
              placeholder="Public Key" 
            />
            <input
              name="signature"
              className="rounded-md p-2 text-xl font-Inter font-semibold bg-white"
              placeholder="Name"
            />

            <button
              type="submit"
              className="rounded-lg px-5 py-2 text-xl font-Inter font-semibold text-white bg-deep-green"
            >
              Connect Wallet
            </button>
          </form> */}

          <LoginForm />

          {/* <ConnectWallet /> */}

          <div className="flex gap-5 flex-row">
            <button className="rounded-md p-2 text-xl font-Inter font-semibold bg-white">
              Leaderboard
            </button>
            <button className="rounded-md p-2 text-xl font-Inter font-semibold bg-white">
              Cashout
            </button>
          </div>
          </div>
        </div>
      </main>
    </GridBackgroundDemo>
  );
}
