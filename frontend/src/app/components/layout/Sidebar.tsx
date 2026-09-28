import { LucideIcon, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { Link, useLocation } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

interface SidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
}

export const Sidebar = ({ items, logo }: SidebarProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);

      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X size={24} className="text-foreground" />
        ) : (
          <Menu size={24} className="text-foreground" />
        )}
      </button>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : mobileMenuOpen ? 0 : -256,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
        }}
        className={clsx(
          "w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen",
          isDesktop ? "relative" : "fixed",
          "top-0 left-0 z-40"
        )}
      >
        <div className="p-6 border-b border-sidebar-border transition-colors duration-300">
          {logo || (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="font-bold text-accent-foreground">VLC</span>
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">
                  VLC Mototaxis
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                    "hover:bg-sidebar-accent hover:pl-5",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    size={20}
                    className={clsx(
                      "transition-transform duration-300",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  <span className="transition-all duration-300">
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};
