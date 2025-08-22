import { auth, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div>
        {/* Search bar can go here */}
      </div>
      <div className="flex items-center space-x-4 space-x-reverse">
        <span>{session?.user?.name}</span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button type="submit" variant="ghost" size="icon">
            <LogOut className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
