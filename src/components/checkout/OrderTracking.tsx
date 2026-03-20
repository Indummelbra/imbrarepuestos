'use client';

import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, MapPin, Box, Loader2 } from 'lucide-react';

export default function OrderTracking() {
  const steps = [
    { id: 1, label: 'Pedido Recibido', status: 'complete', icon: CheckCircle2 },
    { id: 2, label: 'En Alistamiento', status: 'active', icon: Package },
    { id: 3, label: 'Despachado', status: 'pending', icon: Truck },
  ];

  return (
    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Sección de Animación Wow */}
      <div className="relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Box size={120} className="rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 relative">
            {/* Animación de la Caja */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -2, 2, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary relative"
            >
              <Package size={48} strokeWidth={1.5} />
              
              {/* Partículas de "empaque" */}
              <motion.div
                animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], y: [0, -40, -60], x: [0, 10, -10] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="absolute text-primary/40 top-0"
              >
                <CheckCircle2 size={16} />
              </motion.div>
              <motion.div
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [0, -30, -50], x: [0, -20, 20] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                className="absolute text-primary/30 top-0"
              >
                <div className="w-2 h-2 bg-current rounded-full" />
              </motion.div>
            </motion.div>
            
            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
               <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          </div>

          <h3 className="text-xl font-black text-secondary uppercase tracking-tight mb-2">
            Tu pedido está en alistamiento
          </h3>
          <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
            Nuestro equipo está preparando tus productos con el mayor cuidado. ¡Pronto estarán en camino!
          </p>
        </div>

        {/* Timeline Horizontal */}
        <div className="mt-10 px-4">
          <div className="relative flex justify-between items-center max-w-md mx-auto">
            {/* Línea de fondo */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
            {/* Línea de progreso interactiva */}
            <motion.div 
               initial={{ width: "0%" }}
               animate={{ width: "50%" }}
               transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
               className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(255,214,0,0.5)]" 
            />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = step.status === 'complete';
              const isActive = step.status === 'active';
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 * idx, type: 'spring' }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-500 ${
                      isComplete || isActive ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? 'animate-pulse' : ''} />
                  </motion.div>
                  <span className={`absolute top-12 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                    isActive ? 'text-secondary' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sección de Mapa Premium */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-secondary text-white rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden group cursor-pointer"
        onClick={() => window.open('https://maps.app.goo.gl/Ux2F6578pMteEEZ5A', '_blank')}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner flex-shrink-0">
          <MapPin size={32} className="text-primary group-hover:rotate-12 transition-transform" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
           <h4 className="text-lg font-black uppercase tracking-tight mb-1">Localiza tu pedido</h4>
           <p className="text-white/60 text-xs font-medium">Mira en tiempo real dónde nos encontramos procesando tu envío.</p>
        </div>

        <button className="bg-primary text-secondary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-colors">
          Ver Mapa
        </button>
      </motion.div>
    </div>
  );
}
