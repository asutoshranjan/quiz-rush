import Image from 'next/image';
import First from '../../../public/first.png';
import Second from '../../../public/second.png';
import Third from '../../../public/third.png';

function RenderMedal({index}: {index: number}) {
  if(index == 0) {
    return (
      <Image src={First} alt="First" width={32} height={30}/>
    );
  } else if(index == 1) {
    return (
      <Image src={Second} alt="Second" width={32} height={30} />
    );
  } else {
    return (
      <Image src={Third} alt="Third" width={32} height={30} />
    );
  }
}

export default function LeaderboardCard({user, index}: {user: any, index: number}) {
  return (
    <div className={`flex flex-1 flex-row w-full justify-between items-center px-4 py-2 ${index%2 != 0 ? "bg-light-pink-2": "bg-transparent"}`}>
      <div className="flex flex-row items-center flex-1">
        <div className="rounded-full justify-center items-center">
            <RenderMedal index={index} />
        </div>
        <div className="ml-2">
          <h2 className="text-sm font-bold font-Inter text-deep-black">
            {user.name}
          </h2>
          <h2 className="text-xs font-semibold font-Inter text-deep-black">
            {"32A9....hdif"}
          </h2>
        </div>
      </div>
      <h2 className="text-sm font-semibold font-Inter text-deep-black text-center flex-1">
        {user.avgtime}
      </h2>
      <h2 className="text-sm font-semibold font-Inter text-deep-black text-center flex-1">
        {user.matches}
      </h2>
      <h2 className="text-sm font-semibold font-Inter text-deep-black text-center flex-1">
        {user.tokens}
      </h2>
    </div>
  );
}
