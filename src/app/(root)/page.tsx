import { getSession } from '../../auth-utils';
import DashBoard from '../../components/Dashboard';

export default async function Home() {

  const session = await getSession();

  console.log(session);
  
  return (
    <main className="">
      <DashBoard />
    </main>
  );
}
