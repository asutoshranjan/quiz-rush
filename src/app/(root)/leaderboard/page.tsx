import MyGameHistory from "../../../components/GameHistory";
import { GridBackgroundDemo } from "../../../components/UI/Background";

export default function LeaderBoard() {
    return (
            <GridBackgroundDemo>
                <div className="w-full z-10 pb-14">
                <MyGameHistory />
                </div>
            
            </GridBackgroundDemo>
    )
}