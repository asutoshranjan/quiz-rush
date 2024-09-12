import CreateGame from "../../../components/CreateGame";
import { getSession } from "../../../auth-utils";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  console.log(session);

  return <CreateGame />;
}
