import React from "react";
import RevNSLogo from "./revns-logo";
import { Button } from "@repo/ui/components/ui/button";

const AuthNavbar = () => {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <RevNSLogo size="large" />
        <Button className="py-2 px-2 bg-white text-black" >Get Started</Button>
      </div>
    </div>
  );
};

export default AuthNavbar;
