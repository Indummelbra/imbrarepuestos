import React from 'react';
import Image from 'next/image';

interface PaymentLogosProps {
  variant?: 'light' | 'dark';
}

export const PaymentLogos: React.FC<PaymentLogosProps> = ({ variant = 'light' }) => {
  const logoUrl = variant === 'light' 
    ? 'https://static.placetopay.com/placetopay-logo.svg' 
    : 'https://static.placetopay.com/placetopay-logo-dark-background.svg';

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex flex-wrap justify-center items-center gap-6 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
        <Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" width={60} height={24} className="h-6 w-auto" unoptimized />
        <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={60} height={40} className="h-10 w-auto" unoptimized />
        <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={80} height={24} className="h-6 w-auto" unoptimized />
        <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Efecty_logo.svg" alt="Efecty" width={80} height={32} className="h-8 w-auto" unoptimized />
      </div>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Pagos procesados por</span>
        <a href="https://www.placetopay.com/web/" target="_blank" rel="noopener noreferrer">
          <Image 
            src={logoUrl} 
            alt="PlacetoPay by Evertec" 
            width={120}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
        </a>
      </div>
    </div>
  );
};
