import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserProfile } from "@/db/queries/users";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile = await getUserProfile(session.user.id);
  if (!profile?.displayName || profile.displayName === "Security Agent") {
    redirect("/welcome");
  }

  redirect("/home");
}
