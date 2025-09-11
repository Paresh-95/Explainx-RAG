import React from "react";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import AuthNavbar from "../../components/auth-navbar";
export default async function Unauthenticatedlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log(session);
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div >
      <AuthNavbar />
      {children}
    </div>
  );
}
