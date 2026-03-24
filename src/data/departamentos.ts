/**
 * Diccionario de departamentos de Colombia
 * Codigos DANE (DIVIPOLA) mapeados a nombres oficiales
 * Usado por el selector cascada Departamento -> Ciudad en el checkout
 */
export const DEPARTAMENTOS: Record<number, string> = {
  5: 'ANTIOQUIA',
  8: 'ATLANTICO',
  11: 'BOGOTA',
  13: 'BOLIVAR',
  15: 'BOYACA',
  17: 'CALDAS',
  18: 'CAQUETA',
  19: 'CAUCA',
  20: 'CESAR',
  23: 'CORDOBA',
  25: 'CUNDINAMARCA',
  27: 'CHOCO',
  41: 'HUILA',
  44: 'LA GUAJIRA',
  47: 'MAGDALENA',
  50: 'META',
  52: 'NARIÑO',
  54: 'NORTE DE SANTANDER',
  63: 'QUINDIO',
  66: 'RISARALDA',
  68: 'SANTANDER',
  70: 'SUCRE',
  73: 'TOLIMA',
  76: 'VALLE DEL CAUCA',
  81: 'ARAUCA',
  85: 'CASANARE',
  86: 'PUTUMAYO',
  88: 'SAN ANDRES',
  91: 'AMAZONAS',
  94: 'GUAINIA',
  95: 'GUAVIARE',
  97: 'VAUPES',
  99: 'VICHADA',
};

/**
 * Lista ordenada alfabeticamente para renderizar en selects
 * Retorna [{ code, name }] ordenados por nombre
 */
export const DEPARTAMENTOS_LISTA = Object.entries(DEPARTAMENTOS)
  .map(([code, name]) => ({ code: Number(code), name }))
  .sort((a, b) => a.name.localeCompare(b.name));
