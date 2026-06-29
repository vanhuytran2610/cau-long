import React from "react";
import meme1 from "../assets/images/meme1.gif";
import { Link } from "react-router";
import { PointingLeft01Icon, PointingRight01Icon } from "hugeicons-react";
import { useTranslation } from "react-i18next";

export const ComponentMeme1: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <img className="rounded-xl" src={meme1} alt="Animated GIF" width="400" />
      <div className="mt-8">
        <Link to="/money" target="_blank" className="font-primaryMedium hover:underline mt-4 flex items-center justify-center">
          <PointingRight01Icon className="mr-2" size={30} /> {t("componentMeme1.linkText")} <PointingLeft01Icon className="ml-2" size={30} />
        </Link>
      </div>
    </div>
  );
};
