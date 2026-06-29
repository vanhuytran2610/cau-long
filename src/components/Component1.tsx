import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";
import { useTranslation } from "react-i18next";

export const Component1: React.FC<{
  onGoClick: () => void;
  onGoCom3Click: () => void;
  categoryName: string;
}> = ({ onGoClick, onGoCom3Click, categoryName }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center my-24">
      <p className="text-red-600 font-primaryBold text-xl text-center">
        {t("component1.message", { categoryName: categoryName || "" })}
      </p>
      <div className="flex flex-row items-center justify-center my-8">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 mx-3 my-4 border-green-500 w-12 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryMedium rounded-xl"
        >
          {t("component1.goButton") || "Đi"}
        </button>
        <button
          onClick={onGoCom3Click}
          className="bg-red-400 hover:bg-red-500 mx-3 my-4 border-red-500 w-24 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryMedium rounded-xl"
        >
          {t("component1.noButton") || "Không đi"}
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
