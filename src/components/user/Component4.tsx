import React from "react";
import { ComponentMeme1 } from "./ComponentMeme1";
import { useTranslation } from "react-i18next";

export const Component4: React.FC<{
  onGoClick: () => void;
  onGoCom6Click: () => void;
  categoryName: string;
}> = ({ onGoClick, onGoCom6Click, categoryName }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center my-24">
      <p className="text-red-600 font-primaryBold text-xl text-center">
        {t("component4.message", { categoryName: categoryName || "" })}
      </p>
      <div className="flex flex-row items-center justify-center my-8">
        <button
          onClick={onGoClick}
          className="bg-green-400 hover:bg-green-500 mx-3 my-4 border-green-500 w-24 h-24 flex justify-center items-center cursor-pointer text-2xl font-primaryMedium rounded-xl"
        >
          {t("component4.goButton") || "Đi"}
        </button>
        <button
          onClick={onGoCom6Click}
          className="bg-red-400 hover:bg-red-500 mx-3 my-4 border-red-500 w-48 h-12 flex justify-center items-center cursor-pointer text-lg font-primaryMedium rounded-xl"
        >
          {t("component4.noButton") || "Bạn sẽ hối hận đấy"}
        </button>
      </div>
      <ComponentMeme1 />
    </div>
  );
};
