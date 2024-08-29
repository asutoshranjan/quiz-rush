import { GridBackgroundDemo } from "../../../components/UI/Background";
import { getSession } from '../../../auth-utils';
import { redirect } from 'next/navigation';
import RedeemPage from "@/components/Redeem";

export default async function Redeem() {

    const session = await getSession();

  if(!session) {
    redirect("/login");
  }
  console.log(session);
    return (
        <GridBackgroundDemo>
        <div className="w-full md:w-4/5">
            <RedeemPage />
        </div>
        </GridBackgroundDemo>
    )
}