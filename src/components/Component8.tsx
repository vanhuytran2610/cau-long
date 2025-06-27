import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";

export const Component8: React.FC<{
  onGoClick: () => void;
  onGoCom10Click: () => void;
  categoryName: string;
}> = ({ onGoClick, onGoCom10Click, categoryName }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-4 mb-2 sm:my-12">
      <p className="text-red-600 font-primaryBold text-xl text-center">
        {`Ê, đi đánh cầu lông ${categoryName ? categoryName : ""} không?`}
      </p>
      <div className="sm:flex flex-row items-center justify-center mt-8 mb-6">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 sm:mx-3 my-4 border-green-500 w-60 h-60 flex justify-center items-center cursor-pointer text-[100px] font-primaryMedium rounded-xl"
        >
          Đi
        </button>
        <button
          onClick={onGoCom10Click}
          className="bg-red-400 hover:bg-red-500 sm:mx-3 my-4 border-red-500 w-36 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryBold rounded-xl"
        >
          2 chai nước
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
