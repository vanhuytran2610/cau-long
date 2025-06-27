import React, { useEffect, useState } from "react";
import { Component1 } from "../components/Component1";
import { Component3 } from "../components/Component3";
import { Component4 } from "../components/Component4";
import { Component6 } from "../components/Component6";
import { Component8 } from "../components/Component8";
import { Component10 } from "../components/Component10";
import { Component11 } from "../components/Component11";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../redux/store";
import { getSelectedCategory } from "../redux/userSlice";
import Loading from "../components/Loading";

export const MainPage: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState("Component1");
  const { categoryId, categoryName, loadingCategory } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSelectedCategory());
  }, []);

  const handleGoClick = () => {
    setCurrentComponent("Component11"); // All "Go" buttons lead to ComponentFinal
  };

  const handleGoCom1Click = () => {
    setCurrentComponent("Component1"); // "Lần sau" in ComponentFinal returns to ComponentA
  };

  useEffect(() => {
    document.title = "CLB Quảng Đà";
  }, []);

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
