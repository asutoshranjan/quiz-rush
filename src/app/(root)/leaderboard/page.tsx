import MyGameHistory from "../../../components/GameHistory";
import { GridBackgroundDemo } from "../../../components/UI/Background";
import LeaderBoard from "../../../components/Dashboard/leaderBoard";
import { getSession } from "../../../auth-utils";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  console.log(session);
  return (
    <GridBackgroundDemo>
      <div className="w-3/5 z-10">
        <LeaderBoard limit={20} />
      </div>
    </GridBackgroundDemo>
  );
}
