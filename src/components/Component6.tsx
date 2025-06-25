import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";

export const Component6: React.FC<{
  onGoClick: () => void;
  onGoCom8Click: () => void;
}> = ({ onGoClick, onGoCom8Click }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <p className="text-red-600 font-primaryBold text-xl text-center">
        Ê, đi đánh cầu không??
      </p>
      <div className="flex flex-row items-center justify-center my-8">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 mx-3 my-4 border-green-500 w-36 h-36 flex justify-center items-center cursor-pointer text-[60px] font-primaryMedium rounded-xl"
        >
          Đi
        </button>
        <button
          onClick={onGoCom8Click}
          className="bg-red-400 hover:bg-red-500 mx-3 my-4 border-red-500 w-48 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryBold rounded-xl"
        >
          Cho mày cơ hội cuối
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
