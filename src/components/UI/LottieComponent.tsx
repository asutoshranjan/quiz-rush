"use client"
import Lottie from "lottie-react";

export default function LottieComponent({ animationData, loop=false, className }: { animationData: any, loop?: boolean, className:string }) {
    return (
        <Lottie
        className={className}
        animationData={animationData}
        loop={loop}
        />
    );
}