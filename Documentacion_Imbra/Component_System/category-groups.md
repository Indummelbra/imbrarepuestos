# Agrupación de Categorías IMBRA

**Estado:** Aprobada por el cliente · Fecha: 2026-03-28

Fuente de verdad en código: `src/lib/woo-categories.ts` → export `CATEGORY_GROUPS`

Usada en:
- Header → Mega menú "Comprar por..."
- Página `/categorias` → vista agrupada con pestañas

---

## Los 10 grupos

| # | Grupo | Imagen | Categorías incluidas |
|---|---|---|---|
| 1 | **Frenos** | `/categories/frenos_3d.png` | Bandas y Pastillas, Discos de Freno, Eje Abre Bandas, Kit Rep. Bomba Freno, Levas de Freno, Varilla Freno Clutch |
| 2 | **Motor** | `/categories/motor_3d.png` | Guías de Motor, Retenedores, Varillas de Impulso |
| 3 | **Transmisión** | `/categories/transmision.png` | Bujes, Coronas, Eje Tras y Del, Kit Rep. Clutch |
| 4 | **Suspensión** | `/categories/suspension.png` | Kit de Suspensión, Kit Tijera, Resortería |
| 5 | **Eléctrico** | `/categories/electricos_3d.png` | Partes Eléctricas, Direccionales |
| 6 | **Carburación** | `/categories/carburacion.png` | Kit Rep. Carburador, Filtro de Aceite |
| 7 | **Fijación** | `/categories/fijacion.png` | Espárragos, Lainas y Arand. Fij., Tornillería, Tuerca |
| 8 | **Ruedas** | `/categories/wheels_tires.png` | Cauchos, Tensores Rueda |
| 9 | **Herramientas** | `/categories/herramientas_3d.png` | Herramienta Esp., Herramientas y Rimas, Accesorios |
| 10 | **Varios** | `/categories/chasis_3d.png` | Varios |

---

## Slugs exactos (WooCommerce)

```
frenos:       bandas-y-pastillas, discos-de-freno, eje-abre-bandas, kit-rep-bomba-freno, levas-de-freno, varilla-freno-clutch
motor:        guias-de-motor, retenedores, varillas-de-impulso
transmision:  bujes, coronas, eje-tras-y-del, kit-rep-clutch
suspension:   kit-de-suspension, kit-tijera, resorteria
electrico:    partes-electricas, direccionales
carburacion:  kit-rep-carburador, filtro-de-aceite
fijacion:     esparragos, lainas-y-arand-fij, tornilleria, tuerca
ruedas:       cauchos, tensores-rueda
herramientas: herramienta-esp, herramientas-y-rimas, accesorios
varios:       varios
```

---

> Para agregar o mover categorías, editar `CATEGORY_GROUPS` en `src/lib/woo-categories.ts`.
> No duplicar la definición en otros archivos.
