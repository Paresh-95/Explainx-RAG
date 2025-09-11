import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import DashboardClient from "../../../../components/dashboard/DashboardClient";

export default async function Page() {
  const session = await auth();

  return <DashboardClient />;
}
