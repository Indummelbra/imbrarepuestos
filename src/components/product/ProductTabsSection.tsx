"use client";

import { useState } from "react";
import { MessageCircle, Phone, Clock, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface Atributo {
  name: string;
  options: string[];
}

interface ProductTabsSectionProps {
  descripcion: string;
  atributos: Atributo[];
}

/* Preguntas frecuentes con enfoque comercial y de autoridad técnica */
const PREGUNTAS = [
  { q: "¿Tienen garantía directa de fábrica?", a: "Sí. Fabricamos en Colombia bajo estrictos estándares metalmecánicos. Tu repuesto cuenta con garantía total contra defectos de fabricación. Si falla por nuestra causa, respondemos sin intermediarios." },
  { q: "¿Cuánto tarda en llegar mi pedido?", a: "Despachamos a toda Colombia. Si estás en una ciudad principal, lo recibes entre 1 y 3 días hábiles. Para municipios alejados, el tiempo estimado es de 3 a 5 días hábiles." },
  { q: "¿Cómo aseguro que esta pieza le sirve a mi moto?", a: "Revisa la pestaña de 'Especificaciones' o verifica el SKU. Si necesitas precisión absoluta, nuestro equipo técnico está disponible en WhatsApp para confirmarlo antes de tu compra." },
  { q: "¿Qué opciones de pago tienen?", a: "Transacciones 100% blindadas. Aceptamos PSE, tarjetas de crédito/débito y pagos en efectivo (Efecty/Baloto) a través de nuestra pasarela de pagos oficial." },
];

type TabId = "descripcion" | "atributos" | "preguntas";

export default function ProductTabsSection({ descripcion, atributos }: ProductTabsSectionProps) {
  const [tabActiva, setTabActiva] = useState<TabId>("descripcion");
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

  const TABS: { id: TabId; label: string }[] = [
    { id: "descripcion",  label: "Descripción del Producto" },
    { id: "atributos",   label: "Ficha Técnica" },
    { id: "preguntas",   label: "Preguntas Frecuentes" },
  ];

  return (
    <section className="py-14 bg-[#f8f7f5] border-y border-gray-100">
      <div className="imbra-content-container">
        <div className="flex gap-6 xl:gap-8 items-start">

          {/* ── COLUMNA IZQUIERDA: Caja de Soporte ─────────────────── */}
          <aside className="hidden lg:flex flex-col gap-0 w-[200px] xl:w-[220px] shrink-0 bg-white border border-gray-200">
            {/* Avatar + titular */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-secondary)" }}
              >
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <p
                  className="text-[12px] font-black text-secondary leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ¿Dudas Técnicas?
                </p>
                <p
                  className="text-[10px] text-gray-400 leading-tight mt-0.5"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Habla directo con la fábrica
                </p>
              </div>
            </div>

            {/* Telefono */}
            <div className="px-5 py-4 border-b border-gray-100">
              <a
                href="tel:+573228464800"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
              >
                <Phone size={14} style={{ color: "var(--color-primary)" }} />
                <span
                  className="text-[13px] font-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  322 846 4800
                </span>
              </a>
            </div>

            {/* Boton WhatsApp */}
            <div className="px-5 py-4 border-b border-gray-100">
              <a
                href="https://api.whatsapp.com/send?phone=573144693065"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 border font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderColor: "var(--color-primary)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                Asesoría por WhatsApp
              </a>
            </div>

            {/* Horario */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-2">
                <Clock size={13} className="text-gray-300 mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Lunes – Domingos
                  </p>
                  <p
                    className="text-[11px] font-bold text-secondary mt-0.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    7am – 6pm
                  </p>
                  <p
                    className="text-[10px] text-gray-400 mt-0.5"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    (hora Colombia)
                  </p>
                </div>
              </div>

              {/* Sello de confianza */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: "var(--color-primary)" }} />
                <p
                  className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Compra 100% Segura
                </p>
              </div>
            </div>
          </aside>

          {/* ── COLUMNA CENTRAL: Tabs + Contenido ──────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Barra de tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={[
                    "px-5 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px",
                    tabActiva === tab.id
                      ? "border-primary text-secondary"
                      : "border-transparent text-gray-400 hover:text-secondary",
                  ].join(" ")}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido del tab activo */}
            <div className="bg-white border border-gray-200 border-t-0 p-7">

              {/* Tab: Descripción */}
              {tabActiva === "descripcion" && (
                <div
                  className="prose prose-sm max-w-none"
                  style={{ textAlign: "justify", lineHeight: "1.8", color: "#4b5563" }}
                  dangerouslySetInnerHTML={{ __html: descripcion }}
                />
              )}

              {/* Tab: Información Adicional */}
              {tabActiva === "atributos" && (
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-sm border-collapse min-w-[300px]">
                    <tbody>
                      {atributos.length > 0 ? (
                        atributos.map((attr, i) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                          >
                            <td
                              className="py-2.5 px-4 font-bold text-secondary uppercase text-[11px] tracking-widest w-1/3 border border-gray-100 whitespace-normal"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {attr.name}
                            </td>
                            <td
                              className="py-2.5 px-4 text-gray-600 text-[12px] border border-gray-100 break-words"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {attr.options.join(", ")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-4 text-[12px] text-gray-400 italic" colSpan={2}>
                            No hay información adicional para este producto.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Preguntas Frecuentes */}
              {tabActiva === "preguntas" && (
                <ul className="divide-y divide-gray-100">
                  {PREGUNTAS.map((item, i) => (
                    <li key={i} className="py-0">
                      <button
                        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
                        onClick={() =>
                          setPreguntaAbierta(preguntaAbierta === i ? null : i)
                        }
                      >
                        <span
                          className={[
                            "text-[13px] font-bold transition-colors leading-snug",
                            preguntaAbierta === i
                              ? "text-primary"
                              : "text-secondary group-hover:text-primary",
                          ].join(" ")}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item.q}
                        </span>
                        {preguntaAbierta === i ? (
                          <ChevronUp size={15} className="text-primary shrink-0" />
                        ) : (
                          <ChevronDown size={15} className="text-gray-300 shrink-0 group-hover:text-primary transition-colors" />
                        )}
                      </button>
                      {preguntaAbierta === i && (
                        <p
                          className="pb-4 text-[12px] text-gray-600 leading-relaxed"
                          style={{ fontFamily: "var(--font-body)", textAlign: "justify" }}
                        >
                          {item.a}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── COLUMNA DERECHA: Ficha Técnica ─────────────────────── */}
          <aside className="hidden xl:block w-[260px] shrink-0">
            <div className="bg-white border border-gray-200">
              <div
                className="px-5 py-4 border-b border-gray-100"
                style={{ backgroundColor: "var(--color-secondary)" }}
              >
                <h5
                  className="text-[11px] font-black tracking-widest uppercase text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ESPECIFICACIONES
                </h5>
              </div>
              <ul className="divide-y divide-gray-50">
                {atributos.length > 0 ? (
                  atributos.map((attr, i) => (
                    <li key={i} className="px-5 py-3 flex flex-col gap-0.5">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest text-gray-400"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {attr.name}
                      </span>
                      <span
                        className="text-[12px] font-bold text-secondary"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {attr.options.join(", ")}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="px-5 py-4 text-[11px] text-gray-400 italic">
                    Este repuesto no cuenta con especificaciones técnicas registradas.
                  </li>
                )}
              </ul>
            </div>

            {/* Q&A adicional */}
            <div className="mt-4 bg-white border border-gray-200 px-5 py-5">
              <h5
                className="text-[11px] font-black tracking-widest uppercase text-secondary mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LAS MÁS PREGUNTADAS
              </h5>
              <ul className="space-y-3">
                {PREGUNTAS.slice(0, 4).map((item, i) => (
                  <li key={i}>
                    <p
                      className="text-[11px] font-bold text-secondary leading-snug hover:text-primary transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.q}
                    </p>
                    {i < 3 && <div className="h-px bg-gray-50 mt-3" />}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
