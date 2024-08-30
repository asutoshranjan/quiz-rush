"use client";
import { MultiStepLoader } from "../UI/multi-step-loader";


const StepsComponent = () => {



  return (
    <div className="w-full flex flex-col justify-center items-center animate-fadeIn">
        <h2 className="text-base text-gray-700/70 tracking-wider font-semibold font-Inter mb-4">Begin Your Challenge</h2>
     <MultiStepLoader  loadingStates={[{text: "Add Wallet"}, {text: "Start Quiz"}, {text:"Earn Points"}, {text:"Reedem SOL"}, {text: "Create Game"}]} loading={true} />
    </div>
  );
};

export default StepsComponent;
