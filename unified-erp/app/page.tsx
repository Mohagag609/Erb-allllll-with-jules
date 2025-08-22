import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  if (process.env.ENABLE_AUTH === 'false') {
    redirect("/dashboard");
  }

  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
