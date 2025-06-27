import React, { useEffect, useState } from "react";
import { ComponentMeme2 } from "./ComponentMeme2";
import { FormComponent } from "./FormComponent";
import { CameraSmile01Icon, SmileIcon } from "hugeicons-react";

export const Component11: React.FC<{
  onGoCom1Click: () => void;
  categoryId: string;
  categoryName: string;
}> = ({ onGoCom1Click, categoryId, categoryName }) => {
  const [showDelayedContent, setShowDelayedContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayedContent(true);
    }, 3000);

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
      <p className="text-red-600 font-primaryBold text-3xl text-center pb-10">
        {categoryName} nhé! Mày không thoát được đâu!
      </p>
      <ComponentMeme2 />
      {(categoryId || categoryId !== "") && showDelayedContent && (
        <>
          <p className="text-green-700 font-primaryBold text-xl text-center pt-10 pb-6 flex">
            Đùa tí thui!!! Đi thì bạn điền tên rồi bấm "OK" nha, không đi thì
            bấm "Lần sau" nha <span className="ml-2"><CameraSmile01Icon size={25} /></span>
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
