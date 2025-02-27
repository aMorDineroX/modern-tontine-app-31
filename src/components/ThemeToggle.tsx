
import { Moon, Sun } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function ThemeToggle() {
  const { isDarkMode, setIsDarkMode } = useApp();

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-tontine-dark-purple" />
      )}
    </button>
  );
}
