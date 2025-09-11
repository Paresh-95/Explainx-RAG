
import { redirect } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { Upload, MessageCircle } from "lucide-react";
import { auth } from "../../../auth";

export default async function ExamsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen flex w-full bg-zinc-900 ">
            {/* <AppSidebar user={session.user} /> */}
            <main className="flex-1 overflow-auto w-full">

                <div className="w-full">{children}</div>
            </main>
        </div>
    );
}
