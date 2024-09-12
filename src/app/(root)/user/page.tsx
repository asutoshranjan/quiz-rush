import UserProfile from "@/components/UserProfile";
import MyGameHistory from "../../../components/GameHistory";
import { GridBackgroundDemo } from "../../../components/UI/Background";
import { getSession } from '../../../auth-utils';
import { redirect } from 'next/navigation';

export default async function UserPage() {
  const session = await getSession();

  if(!session) {
    redirect("/");
  }
  console.log(session);
  
  return (
    <GridBackgroundDemo>
      <div className="flex flex-col w-full">
        <div className="z-10 mt-14 mb-5">
          <UserProfile />
        </div>
        <div className="w-full z-10 pb-14">
          <MyGameHistory />
        </div>
      </div>
    </GridBackgroundDemo>
  );
}
