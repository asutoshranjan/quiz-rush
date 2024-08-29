import MyGameHistory from "../../../components/GameHistory";
import { GridBackgroundDemo } from "../../../components/UI/Background";
import LeaderBoard from "../../../components/Dashboard/leaderBoard";

export default function Page() {
    return (
            <GridBackgroundDemo>
                <div className="w-3/5 z-10">
                <LeaderBoard limit={20} />
                </div>
                
            
            </GridBackgroundDemo>
    )
}