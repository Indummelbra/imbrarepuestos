interface PageHeroProps {
  label?: string;
  title: string;
  titleAccent?: string; // parte del título en naranja
  subtitle?: string;
  badge?: string;       // número/stat destacado
  badgeLabel?: string;
}

export default function PageHero({
  label,
  title,
  titleAccent,
  subtitle,
  badge,
  badgeLabel,
}: PageHeroProps) {
  return (
    <div className="w-full bg-[#212221] relative overflow-hidden">
      {/* Línea naranja superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

      {/* Patrón de fondo sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative px-4 md:px-[60px] lg:px-[100px] py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            {label && (
              <p className="!text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3 font-display">
                {label}
              </p>
            )}
            <h1 className="font-black uppercase tracking-tighter leading-none text-white text-4xl md:text-5xl lg:text-6xl">
              {titleAccent ? (
                <>
                  {title}{" "}
                  <span className="text-primary">{titleAccent}</span>
                </>
              ) : (
                title
              )}
            </h1>
            {subtitle && (
              <p className="text-gray-400 text-sm mt-4 font-display uppercase tracking-widest">
                {subtitle}
              </p>
            )}
          </div>

          {badge && (
            <div className="shrink-0 border border-white/10 px-6 py-4 text-right">
              <div className="text-4xl font-black text-primary font-display leading-none">
                {badge}
              </div>
              {badgeLabel && (
                <div className="text-gray-500 text-[10px] uppercase tracking-widest mt-1 font-display">
                  {badgeLabel}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Línea naranja inferior */}
      <div className="absolute bottom-0 left-0 w-24 h-1 bg-primary" />
    </div>
  );
}
