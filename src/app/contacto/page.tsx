"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import {
  MapPin, Phone, Mail, CheckCircle, MessageCircle,
  Headphones, Navigation, ExternalLink, Star, SendHorizontal,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faYoutube, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mailtoUrl = `mailto:servicioalcliente@imbrarepuestos.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailtoUrl;
    setSent(true);
  }

  const SOCIAL = [
    { href: "https://facebook.com/imbrarepuestos", label: "Facebook", fa: faFacebook },
    { href: "https://instagram.com/imbrarepuestos", label: "Instagram", fa: faInstagram },
    { href: "https://www.youtube.com/@ImbaColombia", label: "YouTube", fa: faYoutube },
    { href: "https://api.whatsapp.com/send?phone=573144693065", label: "WhatsApp", fa: faWhatsapp },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow pt-0">

        {/* ── Franja del mapa ── */}
        <div className="relative w-full h-[420px] overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1252.62775995152!2d-74.1056528847669!3d4.621732739372512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99aad57a400d%3A0xd661c6b21ec5d648!2sImbra%20Repuestos%20y%20herramienta%20para%20moto!5e0!3m2!1ses-419!2sco!4v1774751656077!5m2!1ses-419!2sco"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="IMBRA Repuestos — Bogotá"
          />

          {/* ── Fichita estilo Google Maps ── */}
          <div className="absolute top-4 left-4 xl:left-8 z-10 bg-white shadow-lg w-[340px] px-4 py-3 rounded-sm flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-secondary text-[11px] leading-snug">
                Imbra Repuestos y herramienta para moto
              </p>
              <p className="text-[10px] text-gray-400 leading-snug mt-0.5">
                Calle 10A Nº 45-02, Zona Industrial de Gorgonzola, Bogotá
              </p>
              <a
                href="https://www.google.com/search?sca_esv=4b6756fe69c99ed1&rlz=1C1VDKB_esCO1193CO1193&sxsrf=ANbL-n4wBseZy9pJbpyKagxh1p0qxzqnNw:1774752881476&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOZ4TcDL24Kom40H07ZlIFY1ZDjjtzQhQZiJGlSpWZbAdd6VvZ4LXItHQN3D9gmypQW_FVHbjFPFOcv5d68tdD9Yn1eOt2poToy1U9NjujQln0JU6tuys6-4htzLCum5NneHTQes0dCPAKroJgRRj7o3ex4pF&q=Industrias+Metalmecanicas+BRA+-+Indummelbra+S.A.+Opiniones&sa=X&ved=2ahUKEwjb1sHYjcSTAxUkTTABHRb7F5AQ0bkNegQIIxAH&biw=1536&bih=730&dpr=1.25"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-1.5 group w-fit"
              >
                <span className="text-[10px] font-bold text-secondary">4.6</span>
                {[1,2,3,4].map((i) => (
                  <Star key={i} size={10} className="fill-[#F9AB00] text-[#F9AB00]" />
                ))}
                <Star size={10} className="fill-[#F9AB00]/50 text-[#F9AB00]" />
                <span className="text-[10px] text-[#1a73e8] group-hover:underline ml-0.5">(17)</span>
              </a>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <a
                href="https://www.google.com/local/place/fid/0x8e3f995c10b52c21:0xdad2256d24c4f170/photosphere?iu=https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid%3DXkoO4Recut1e5alWvTGrfQ%26cb_client%3Dlu.gallery.gps%26w%3D160%26h%3D106%26yaw%3D92.84005%26pitch%3D0%26thumbfov%3D100&ik=CAISFlhrb080UmVjdXQxZTVhbFd2VEdyZlE%3D"
                target="_blank" rel="noopener noreferrer" title="Ver en Google Maps"
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <ExternalLink size={14} />
              </a>
              <a
                href="https://www.google.com/maps?rlz=1C1VDKB_esCO1193CO1193&um=1&ie=UTF-8&fb=1&gl=co&sa=X&geocode=KSEstRBcmT-OMXDxxCRtJdLa&daddr=4%C2%B037%2718.+74%C2%B006%2319,+Cra.+0+%235%22N,+Bogot%C3%A1"
                target="_blank" rel="noopener noreferrer" title="Cómo llegar"
                className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white hover:bg-[#1558b0] transition-colors"
              >
                <Navigation size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Segunda sección encajonada ── */}
        <div className="relative z-10 pb-20 px-4 md:px-[60px] lg:px-[100px]">
          <div className="bg-white shadow-[0_4px_40px_rgba(0,0,0,0.14)] px-8 md:px-14 pt-14 pb-16">

            {/* Header centrado */}
            <div className="text-center mb-12">
              <h1 className="font-black text-secondary text-4xl uppercase tracking-tight">Contáctanos</h1>
              <p className="text-gray-400 text-sm mt-3">¡Estamos a tu disposición los 7 días de la semana!</p>
            </div>

            {/* Dos columnas */}
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

              {/* ── Columna Izquierda ── */}
              <div className="md:w-[300px] shrink-0 flex flex-col gap-6">

                {/* Sede */}
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Sede Principal</p>
                    <p className="text-sm text-gray-500 leading-snug">
                      Calle 10A Nº 45-02<br />
                      Zona Industrial de Gorgonzola<br />
                      Bogotá, Colombia
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Teléfonos */}
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Teléfonos</p>
                    <a href="tel:+5713350591" className="block text-sm text-gray-500 hover:text-primary transition-colors">
                      PBX Bogotá: (1) 335 0591
                    </a>
                    <a href="tel:+573204089600" className="block text-sm text-gray-500 hover:text-primary transition-colors mt-0.5">
                      Celular: 320 408 9600
                    </a>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Correos */}
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Correos</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Ventas", email: "ventas@imbrarepuestos.com" },
                        { label: "Servicio al Cliente", email: "servicioalcliente@imbrarepuestos.com" },
                        { label: "Comercio Exterior", email: "comexterior@imbrarepuestos.com" },
                        { label: "Negocios Internacionales", email: "negociosinternacionales@imbrarepuestos.com" },
                      ].map(({ label, email }) => (
                        <div key={email}>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">{label}</p>
                          <a href={`mailto:${email}`} className="text-[11px] text-gray-500 hover:text-primary transition-colors break-all">
                            {email}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Columna Derecha: Formulario ── */}
              <div className="flex-1">
                <h2 className="font-black text-secondary text-xl uppercase tracking-tight mb-1">
                  Nos encantaría saber de ti.
                </h2>
                <p className="text-gray-400 text-xs mb-6">
                  Los campos requeridos están marcados con *
                </p>

                {sent ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <CheckCircle size={52} className="text-primary mb-4" />
                    <p className="font-black text-secondary text-lg uppercase">¡Mensaje enviado!</p>
                    <p className="text-gray-400 text-sm mt-2">Nos pondremos en contacto contigo pronto.</p>
                    <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1.5">Nombre completo *</label>
                        <input name="name" required value={form.name} onChange={handleChange} placeholder="Tu nombre"
                          className="w-full bg-gray-100 rounded-sm px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:bg-gray-200 transition-colors" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1.5">Correo electrónico *</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com"
                          className="w-full bg-gray-100 rounded-sm px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:bg-gray-200 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1.5">Asunto *</label>
                      <input name="subject" required value={form.subject} onChange={handleChange} placeholder="Asunto del mensaje"
                        className="w-full bg-gray-100 rounded-sm px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:bg-gray-200 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1.5">Mensaje *</label>
                      <textarea name="message" required rows={7} value={form.message} onChange={handleChange} placeholder="Escribe tu mensaje aquí..."
                        className="w-full bg-gray-100 rounded-sm px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:bg-gray-200 transition-colors resize-none" />
                    </div>
                    <button type="submit"
                      className="self-start flex items-center gap-2 bg-primary text-white text-[11px] font-black uppercase tracking-widest px-10 py-3 hover:bg-secondary transition-colors">
                      <SendHorizontal size={14} />
                      Enviar
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* ── Franja Redes + Experto ── */}
            <div className="mt-14 -mx-8 md:-mx-14 bg-secondary">
              <div className="flex flex-col md:flex-row">

                {/* Redes Sociales */}
                <div className="flex-1 px-10 py-8 border-b md:border-b-0 md:border-r border-white/10">
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-5">Síguenos en redes</p>
                  <div className="flex gap-5">
                    {SOCIAL.map(({ href, label, fa }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 group">
                        <div className="w-10 h-10 border border-white/30 flex items-center justify-center text-white group-hover:border-primary group-hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={fa} className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] text-white/60 uppercase tracking-widest group-hover:text-primary transition-colors">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Experto */}
                <div className="px-10 py-8 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <Headphones size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">¿Necesitas ayuda?</p>
                    <p className="text-white text-[11px] mb-1">Llama a nuestro experto</p>
                    <a href="tel:+573228464800" className="text-white font-black text-[15px] hover:text-primary transition-colors block">
                      (+57) 322 846 4800
                    </a>
                    <p className="text-white/40 text-[9px] mt-1">Lun – Dom · 7am – 6pm</p>
                  </div>
                  <a href="https://api.whatsapp.com/send?phone=573144693065" target="_blank" rel="noopener noreferrer"
                    className="ml-4 flex items-center gap-2 border border-primary text-primary text-[10px] font-black uppercase tracking-widest px-5 py-2.5 hover:bg-primary hover:text-white transition-colors shrink-0">
                    <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5" />
                    Chatear
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
