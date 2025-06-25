import React from "react";
import meme1 from "../assets/images/meme1.gif";

export const ComponentMeme1: React.FC = () => {
  return (
    <div>
      <img className="rounded-xl" src={meme1} alt="Animated GIF" width="400" />
    </div>
  );
};
