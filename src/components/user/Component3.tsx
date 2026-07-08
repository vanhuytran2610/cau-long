import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";
import { useTranslation } from "react-i18next";

export const Component3: React.FC<{
  onGoClick: () => void;
  onGoCom4Click: () => void;
  categoryName: string;
}> = ({ onGoClick, onGoCom4Click, categoryName }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center my-24">
      <p className="text-red-600 font-primaryBold text-xl text-center">
        {t("component3.message", { categoryName: categoryName || "" })}
      </p>
      <div className="flex flex-row items-center justify-center my-8">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 mx-3 my-4 border-green-500 w-20 h-20 flex justify-center items-center cursor-pointer text-xl font-primaryMedium rounded-xl"
        >
          {t("component3.goButton") || "Đi"}
        </button>
        <button
          onClick={onGoCom4Click}
          className="bg-red-400 hover:bg-red-500 mx-3 my-4 border-red-500 w-48 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryMedium rounded-xl"
        >
          {t("component3.noButton") || "Cho bạn suy nghĩ lại!"}
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
