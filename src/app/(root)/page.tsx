import { getSession } from '../../auth-utils';
import DashBoard from '../../components/Dashboard';
import { redirect } from 'next/navigation';

export default async function Home() {

  const session = await getSession();

  if(!session) {
    redirect("/login");
  }

  console.log(session);
  
  return (
    <main className="">
      <DashBoard />
    </main>
  );
}
