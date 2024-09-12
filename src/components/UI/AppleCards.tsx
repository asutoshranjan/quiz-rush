"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Carousel, Card } from "./apple-cards-carousel";
import Toast from "../Toast";

export function AppleCards() {
  const [response, setResponse] = useState<any>(null);

  const fetchData = async (reqData?: any) => {
    try {
      const response = await fetch(`/api/getquestionsets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        Toast({ type: "Error", message: "Failed to fetch quiz" });
        throw new Error("Failed to fetch quiz.");
      }

      const resdata = await response.json();
      console.log("Data:", resdata);

      // format the data to match the Card main data

      const formatedData = resdata.map((data: any) => {
        return {
          category: data.category,
          title: data.setTitle,
          src: data.imageUrl,
          content: <DummyContent />,
        };
      });

      console.log("Formated Data:", formatedData);

      setResponse(formatedData);
    } catch (err) {
      console.log(err);
      Toast({ type: "Error", message: "Failed to fetch quiz" });
    }
  };

  useEffect(() => {
    fetchData({});
  }, []);

  if (response == null || response.length === 0) {
    return (
      <div className="h-[28rem] flex flex-col items-center justify-center">
        <div className="text-gray-500">Loading..</div>
      </div>
    );
  } else {
    const cards = response.map((card: any, index: number) => (
      <Card key={card.src} card={card} index={index} />
    ));

    return <Carousel items={cards} />;
  }
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            <Image
              src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Macbook mockup from Aceternity UI"
              height="500"
              width="500"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
            />
          </div>
        );
      })}
    </>
  );
};
