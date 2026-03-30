import React from "react";

const benefits = [
  {
    icon: "local_shipping",
    title: "Envíos a toda Colombia",
    desc: "Tu repuesto llega donde estés — en días, no semanas.",
  },
  {
    icon: "verified",
    title: "Garantía del fabricante",
    desc: "Lo fabricamos nosotros — si falla, respondemos nosotros. 50 años lo avalan.",
  },
  {
    icon: "sell",
    title: "Precio directo del fabricante",
    desc: "Sin intermediarios. Pagas lo que paga el taller más grande del país.",
  },
  {
    icon: "support_agent",
    title: "Soporte del fabricante",
    desc: "Habla con quien fabrica el repuesto. No con un vendedor. Con el experto.",
  },
  {
    icon: "security",
    title: "Paga como prefieras",
    desc: "PSE, tarjeta de crédito o débito — el método que más te convenga.",
  },
];

export default function ProductBenefitsBar() {
  return (
    <section className="w-full py-12 bg-[#f8f9fa] border-t border-gray-200">
      <div className="imbra-content-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-8 lg:gap-x-4 px-4 lg:px-0 max-w-7xl mx-auto justify-items-center">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center lg:items-start space-x-4 group hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex-shrink-0 text-[#F18700] mt-1">
                <span className="material-icons text-[40px] drop-shadow-sm group-hover:rotate-6 transition-transform">
                  {benefit.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <h5 className="imbra-label !text-secondary group-hover:!text-primary transition-colors">
                  {benefit.title}
                </h5>
                <p className="imbra-body !text-[11px] !leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
