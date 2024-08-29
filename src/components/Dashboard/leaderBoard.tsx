"use client";
import { useState, useEffect } from "react";
import LeaderboardCard from "../UI/LeaderboardCard";

export default function LeaderBoard({limit} : {limit?: number}) {
  const [Rankers, setRankers] = useState([]);

  const fetchData = async () => {
    const responce = await fetch(`/api/leader`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: limit || 5,
      }),
    });

    const data = await responce.json();
    setRankers(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {Rankers.length > 0 ? (
        <div>
          <div>
            <div className="flex flex-row flex-1 w-full text-center justify-between items-center mt-10 px-4 py-2 rounded-t-2xl bg-light-pink-2">
              <div className="flex flex-row items-center flex-1">
                <div className="w-11 rounded-full"></div>
                <h2 className="text-sm font-bold font-Inter text-black/70  ml-2">
                  User
                </h2>
              </div>
              <h2 className="text-sm font-bold font-Inter text-black/70 flex-1">
                Avg. Time
              </h2>
              <h2 className="text-sm font-bold font-Inter text-black/70  flex-1">
                Matches
              </h2>
              <h2 className="text-sm font-bold font-Inter text-black/70  flex-1">
                Points
              </h2>
            </div>
          </div>
          <div className="bg-light-pink max-h-96 w-full overflow-y-auto aspect-video rounded-b-2xl flex flex-col scroll-smooth [scrollbar-width:none]">
            {Rankers.map((user, index) => {
              return <LeaderboardCard user={user} key={index} index={index} />;
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-96"> </div>
      )}
    </div>
  );
}
