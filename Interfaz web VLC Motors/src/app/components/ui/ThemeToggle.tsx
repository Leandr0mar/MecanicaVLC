import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'motion/react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 hover:bg-muted rounded-lg transition-colors group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Cambiar tema"
    >
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            opacity: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : 180,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Moon size={20} className="text-accent" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            scale: theme === 'light' ? 1 : 0,
            opacity: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : -180,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Sun size={20} className="text-accent" />
        </motion.div>
      </div>
    </motion.button>
  );
};
