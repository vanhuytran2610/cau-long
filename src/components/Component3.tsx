import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";

export const Component3: React.FC<{
  onGoClick: () => void;
  onGoCom4Click: () => void;
  categoryName: string;
}> = ({ onGoClick, onGoCom4Click, categoryName }) => {
  return (
    <div className="flex flex-col items-center justify-center my-24">
      <p className="text-red-600 font-primaryBold text-xl text-center">
        {`Ê, đi đánh cầu lông ${categoryName ? categoryName : ""} không?`}
      </p>
      <div className="flex flex-row items-center justify-center my-8">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 mx-3 my-4 border-green-500 w-20 h-20 flex justify-center items-center cursor-pointer text-xl font-primaryMedium rounded-xl"
        >
          Đi
        </button>
        <button
          onClick={onGoCom4Click}
          className="bg-red-400 hover:bg-red-500 mx-3 my-4 border-red-500 w-48 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryMedium rounded-xl"
        >
          Cho bạn suy nghĩ lại!
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
