import React, { useEffect, useState } from "react";
import { ComponentMeme2 } from "./ComponentMeme2";
import { FormComponent } from "./FormComponent";
import { useTranslation } from "react-i18next";

export const Component12: React.FC<{
  onGoCom1Click: () => void;
  categoryId: string;
  categoryName: string;
  categoryContent: string;
}> = ({ onGoCom1Click, categoryId, categoryName, categoryContent }) => {
  const [showDelayedContent, setShowDelayedContent] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayedContent(true);
    }, 1000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        (categoryId || categoryId !== "") && showDelayedContent
          ? "my-16"
          : "my-36"
      }`}
    >
      <p className="text-red-400 font-primaryBold text-3xl text-center pb-6">
        {t("component12.message", { categoryName: categoryName || "" })}
      </p>
      <p className="text-lg font-primaryMedium pb-8 text-gray-600 flex items-center justify-center text-center mx-4">
        {categoryContent}
      </p>
      <ComponentMeme2 />
      {(categoryId || categoryId !== "") && showDelayedContent && (
        <>
          <p className="text-green-700 font-primaryBold text-xl text-center pt-10 pb-6">
            {t("component12.formMessage")}
          </p>
          <FormComponent
            onGoCom1Click={onGoCom1Click}
            categoryId={categoryId}
          />
        </>
      )}
    </div>
  );
};
