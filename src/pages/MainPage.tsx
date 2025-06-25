import React, { useState } from "react";
import { Component1 } from "../components/Component1";
import { Component3 } from "../components/Component3";
import { Component4 } from "../components/Component4";
import { Component6 } from "../components/Component6";
import { Component8 } from "../components/Component8";
import { Component10 } from "../components/Component10";
import { Component11 } from "../components/Component11";

export const MainPage: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState("Component1");

  const handleGoClick = () => {
    setCurrentComponent("Component11"); // All "Go" buttons lead to ComponentFinal
  };

  const handleFormSubmit = (username: string): void => {
    // Handle form submission logic here
    console.log("Form submitted with username:", username);
  };

  const handleGoCom1Click = () => {
    setCurrentComponent("Component1"); // "Lần sau" in ComponentFinal returns to ComponentA
  };

  const caseComponent = () => {
    switch (currentComponent) {
      case "Component1":
        return (
          <Component1
            onGoClick={handleGoClick}
            onGoCom3Click={() => setCurrentComponent("Component3")}
          />
        );
      case "Component3":
        return (
          <Component3
            onGoClick={handleGoClick}
            onGoCom4Click={() => setCurrentComponent("Component4")}
          />
        );
      case "Component4":
        return (
          <Component4
            onGoClick={handleGoClick}
            onGoCom6Click={() => setCurrentComponent("Component6")}
          />
        );
      case "Component6":
        return (
          <Component6
            onGoClick={handleGoClick}
            onGoCom8Click={() => setCurrentComponent("Component8")}
          />
        );
      case "Component8":
        return (
          <Component8
            onGoClick={handleGoClick}
            onGoCom10Click={() => setCurrentComponent("Component10")}
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
            onSubmitClick={handleFormSubmit}
            onGoCom1Click={handleGoCom1Click}
          />
        );
      default:
        return (
          <Component1
            onGoClick={handleGoClick}
            onGoCom3Click={() => setCurrentComponent("Component3")}
          />
        );
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="max-w-7xl w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
          <div className="">{caseComponent()}</div>
        </div>
      </div>
    </>
  );
};
