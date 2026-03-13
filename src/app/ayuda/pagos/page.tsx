import { ShieldCheck, HelpCircle } from 'lucide-react';
import Image from 'next/image';

export default function PaymentsFAQPage() {
  const faqs = [
    {
      q: "¿Qué es Evertec Placetopay?",
      a: "Evertec Placetopay es la plataforma de pagos electrónicos que usa Imbra Store para procesar en línea las transacciones generadas en la tienda virtual con las formas de pago habilitadas para tal fin."
    },
    {
      q: "¿Cómo puedo pagar?",
      a: "En la tienda virtual de Imbra Store usted podrá realizar su pago con los medios habilitados para tal fin. Usted podrá pagar a través de tarjetas de crédito (Visa, Mastercard, American Express), PSE (Cuentas de ahorros y corriente) y efectivo a través de redes habilitadas."
    },
    {
      q: "¿Es seguro ingresar mis datos bancarios en este sitio web?",
      a: "Para proteger tus datos Imbra Store delega en Evertec Placetopay la captura de la información sensible. Nuestra plataforma de pagos cumple con los más altos estándares exigidos por la norma internacional PCI DSS de seguridad en transacciones con tarjeta de crédito. Además, tiene certificado de seguridad SSL, el cual garantiza comunicaciones seguras mediante la encriptación de todos los datos hacia y desde el sitio."
    },
    {
      q: "¿Puedo realizar el pago cualquier día y a cualquier hora?",
      a: "Sí, en Imbra Store podrás realizar tus compras en línea los 7 días de la semana, las 24 horas del día a sólo un clic de distancia."
    },
    {
      q: "¿Pagar electrónicamente tiene algún valor para mí como comprador?",
      a: "No, los pagos electrónicos realizados a través de Evertec Placetopay no generan costos adicionales para el comprador."
    }
  ];

  return (
    <div className="max-w-[1920px] mx-auto px-3 lg:px-4 xl:px-5 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="text-yellow-500 w-8 h-8" />
          Preguntas Frecuentes sobre Pagos
        </h1>
        <p className="text-gray-600">
          Todo lo que necesitas saber sobre la seguridad y el proceso de tus transacciones en Imbra Store.
        </p>
      </div>

      <div className="grid gap-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border-l-4 border-yellow-500 rounded-r-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-yellow-500" />
            Transacciones 100% Seguras
          </h2>
          <p className="text-gray-400 text-sm">
            Nuestra plataforma cumple con los estándares PCI DSS y cuenta con certificados SSL para garantizar que tu información esté siempre protegida.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Image 
            src="https://static.placetopay.com/placetopay-logo-dark-background.svg" 
            alt="PlacetoPay" 
            width={120}
            height={40}
            className="h-10 w-auto opacity-80"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
