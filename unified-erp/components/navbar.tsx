export function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div>
        {/* Search bar can go here */}
      </div>
      <div className="flex items-center space-x-4 space-x-reverse">
        <span>المستخدم</span>
      </div>
    </header>
  );
}
