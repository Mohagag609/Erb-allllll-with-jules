import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900/50 border-b dark:border-gray-700/50">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="بحث عام..." className="w-64 md:w-96 pr-10" />
      </div>
      <div className="flex items-center space-x-4 space-x-reverse">
        {/* Other navbar items like notifications or theme toggle can go here */}
      </div>
    </header>
  );
}
