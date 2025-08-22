import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (process.env.ENABLE_AUTH === 'false') {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return null; // This component will not render anything.
}
