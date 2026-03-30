"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PremiumDropdownProps {
  options: string[] | number[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  number?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function PremiumDropdown({
  options,
  value,
  onChange,
  placeholder,
  label,
  number,
  disabled = false,
  loading = false,
  className,
}: PremiumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string | number) => {
    onChange(option.toString());
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full group", className)}
    >
      {/* Etiqueta flotante (opcional) */}
      {label && (
        <label className="absolute -top-6 left-0 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          {label}
        </label>
      )}

      {/* Trigger del Dropdown */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-[45px] px-4 flex items-center gap-0 transition-all duration-300 rounded-[3px] border",
          "bg-white", 
          "border-[#e5e7eb] hover:border-primary/50",
          isOpen ? "border-primary ring-2 ring-primary/5" : "",
          disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {/* Número de paso circular (1, 2, etc.) al estilo Autozpro */}
        {number && (
          <div className="flex items-center mr-3">
            <div className="w-6 h-6 rounded-full bg-[#f3f4f6] flex items-center justify-center border border-[#e5e7eb]">
              <span className="text-[#1a1a1a] text-[11px] font-extrabold leading-none">
                {number.replace(/^0+/, '')}
              </span>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1 text-left min-w-0">
          <p className={cn(
            "text-[12px] font-extrabold uppercase tracking-tight truncate",
            value ? "text-[#1a1a1a]" : "text-[#6b7280]" // Color gris para placeholder si no hay valor
          )}>
            {loading ? "Cargando..." : (value || placeholder)}
          </p>
        </div>


        {/* Icono de estado */}
        <div className="flex items-center justify-center w-5 h-5 ml-2 text-primary">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronDown 
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                isOpen && "rotate-180"
              )} 
            />
          )}
        </div>
      </button>

      {/* Menú Desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 z-[100] mt-1 max-h-[300px] overflow-hidden",
              "bg-[#1a1a1a] border border-white/10 rounded-[3px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]",
              "backdrop-blur-xl"
            )}
          >
            <div className="overflow-y-auto max-h-[298px] custom-scrollbar py-2">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wider transition-all",
                      "hover:bg-primary hover:text-secondary",
                      value.toString() === option.toString() 
                        ? "bg-primary/10 text-primary font-black ml-1 border-l-2 border-primary" 
                        : "text-white/70"
                    )}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-white/30 text-[11px] uppercase tracking-widest font-medium">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos adicionales para el scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ff6a00;
        }
      `}</style>
    </div>
  );
}
