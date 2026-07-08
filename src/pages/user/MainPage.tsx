import React, { useEffect, useState } from "react";
import { Component1 } from "../../components/user/Component1";
import { Component3 } from "../../components/user/Component3";
import { Component4 } from "../../components/user/Component4";
import { Component6 } from "../../components/user/Component6";
import { Component8 } from "../../components/user/Component8";
import { Component10 } from "../../components/user/Component10";
import { Component11 } from "../../components/user/Component11";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../redux/store";
import { getSelectedCategory } from "../../redux/userSlice";
import Loading from "../../components/Loading";
import { Component12 } from "../../components/user/Component12";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../redux/languageSlice";

export const MainPage: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState("Component1");
  const { categoryId, categoryName, loadingCategory, categoryContent } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const language = useSelector((state: RootState) => state.language.language);

  useEffect(() => {
    dispatch(getSelectedCategory());
  }, [dispatch, language]);

  const handleGoClick = () => {
    setCurrentComponent("Component12"); // All "Go" buttons lead to ComponentFinal
  };

  const handleGoCom1Click = () => {
    setCurrentComponent("Component1"); // "Lần sau" in ComponentFinal returns to ComponentA
  };

  useEffect(() => {
    if (categoryName) {
      document.title = t("mainPage.title", { categoryName });
    }
  }, [categoryName, t]);

  const caseComponent = () => {
    switch (currentComponent) {
      case "Component1":
        return (
          <Component1
            onGoClick={handleGoClick}
            onGoCom3Click={() => setCurrentComponent("Component3")}
            categoryName={categoryName || ""}
          />
        );
      case "Component3":
        return (
          <Component3
            onGoClick={handleGoClick}
            onGoCom4Click={() => setCurrentComponent("Component4")}
            categoryName={categoryName || ""}
          />
        );
      case "Component4":
        return (
          <Component4
            onGoClick={handleGoClick}
            onGoCom6Click={() => setCurrentComponent("Component6")}
            categoryName={categoryName || ""}
          />
        );
      case "Component6":
        return (
          <Component6
            onGoClick={handleGoClick}
            onGoCom8Click={() => setCurrentComponent("Component8")}
            categoryName={categoryName || ""}
          />
        );
      case "Component8":
        return (
          <Component8
            onGoClick={handleGoClick}
            onGoCom10Click={() => setCurrentComponent("Component10")}
            categoryName={categoryName || ""}
          />
        );
      case "Component10":
        return (
          <Component10
            onGoClick={handleGoClick}
            onGoCom11Click={() => setCurrentComponent("Component11")}
          />
        );
      case "Component11":
        return (
          <Component11
            onGoCom1Click={handleGoCom1Click}
            categoryId={categoryId || ""}
            categoryName={categoryName || ""}
            categoryContent={categoryContent || ""}
          />
        );
      case "Component12":
        return (
          <Component12
            onGoCom1Click={handleGoCom1Click}
            categoryId={categoryId || ""}
            categoryName={categoryName || ""}
            categoryContent={categoryContent || ""}
          />
        );
      default:
        return (
          <Component1
            onGoClick={handleGoClick}
            onGoCom3Click={() => setCurrentComponent("Component3")}
            categoryName={categoryName || ""}
          />
        );
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 p-0.5 text-sm font-primaryMedium">
        <button
          onClick={() => dispatch(setLanguage("vi"))}
          className={`px-2.5 py-1 rounded-lg transition-colors ${language === "vi" ? "bg-yellow-400 hover:bg-yellow-500 shadow text-black" : "text-gray-500 hover:text-gray-700"}`}
        >
          VI
        </button>
        <button
          onClick={() => dispatch(setLanguage("en"))}
          className={`px-2.5 py-1 rounded-lg transition-colors ${language === "en" ? "bg-yellow-400 hover:bg-yellow-500 shadow text-black" : "text-gray-500 hover:text-gray-700"}`}
        >
          EN
        </button>
      </div>
      <div
        className={`flex justify-center transition-opacity duration-300 ${
          loadingCategory ? "pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="max-w-7xl w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
          <div className="">{caseComponent()}</div>
        </div>
      </div>
      {loadingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center">
            <Loading size="md" />
          </div>
        </div>
      )}
    </div>
  );
};
