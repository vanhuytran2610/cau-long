import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";

export const Component10: React.FC<{
  onGoClick: () => void;
  onGoCom11Click: () => void;
}> = ({ onGoClick, onGoCom11Click }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 sm:mt-0">
      {/* <p className="text-red-600 font-primaryBold text-xl text-center">
        
      </p> */}
      <div className="sm:flex flex-row items-center justify-center mt-0 mb-0">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 my-1 md:mx-3 border-green-500 w-80 sm:w-[490px] h-80 sm:h-[490px] flex justify-center items-center cursor-pointer text-[200px] sm:text-[370px] font-primaryMedium rounded-xl"
        >
          Đi
        </button>
        <button
          onClick={onGoCom11Click}
          className="bg-red-400 hover:bg-red-500 md:mx-3 my-4 border-red-500 w-36 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryBold rounded-xl"
        >
          TAO BAO...
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
