import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TransitionScreen from "./TransitionScreen";
import { getUserProfile } from "@/db/queries/users";

export default async function TransitionPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile = await getUserProfile(session.user.id);
  const needsWelcome = !profile?.displayName || profile.displayName === "Security Agent";

  return <TransitionScreen nextRoute={needsWelcome ? "/welcome" : "/home"} />;
}
