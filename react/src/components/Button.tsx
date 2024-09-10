// ButtonPost.tsx
import React, { useState } from "react";
import "../styles.css";
import iconSettings from "./assets/settings.png"; // Actualizează calea și extensia

const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

export const ButtonPost = ({ onClick }: { onClick: () => void }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClick = async () => {
        setIsLoading(true);
        await delay(3500);
        setIsLoading(false);
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`button ${isLoading ? "loading" : ""}`}
        >
            <img src={iconSettings} alt="Settings" />
            <span>{isLoading ? "Preparing" : "Change"}</span>
        </button>
    );
};
