# Guía para Editores — Hero Slider

> Esta guía explica cómo agregar, editar o reemplazar las imágenes del banner principal (hero slider) del sitio Imbra Store desde WordPress.

---

## ¿Dónde subir la imagen?

1. Ingresar a **WordPress Admin**
2. Ir al menú **Medios → FileBird**
3. Abrir la carpeta llamada **"Slider"**
4. Subir la imagen dentro de esa carpeta

---

## Nombre recomendado del archivo

Nombrar el archivo antes de subirlo, en este formato:

```
Slider-Imbra-1.jpg
Slider-Imbra-2.jpg
Slider-Imbra-3.jpg
```

El número indica el **orden de aparición** en el slider (1 = primero).

> **Tamaño ideal de la imagen:** 1920 × 1080 px, formato horizontal.  
> La imagen debe tener **zona oscura a la izquierda** para que el texto blanco se lea bien sobre ella.

---

## Campos a rellenar al subir la imagen

Al hacer clic sobre la imagen en FileBird, aparece un panel a la derecha con estos campos:

### 1. Texto alternativo
La **etiqueta naranja pequeña** que aparece arriba del título en el slider.

```
⚡ DIRECTO DEL FABRICANTE
```

> Se puede usar el emoji ⚡ o dejarlo sin emoji. Siempre en MAYÚSCULAS.

---

### 2. Título
El **subtítulo** — texto pequeño que aparece debajo del título grande.

```
Diseñadas para trabajar mejor, más rápido y con precisión
```

---

### 3. Leyenda
**Dejar vacío.** Este campo no se usa en el slider.

---

### 4. Descripción
Este campo controla el **título grande**, el **texto del botón** y la **URL de destino**.

Debe escribirse en **exactamente 3 líneas**, así:

```
Herramienta Especializada IMBRA
VER HERRAMIENTAS
/tienda
```

| Línea | Qué es | Ejemplo |
|-------|--------|---------|
| Línea 1 | Título grande del slide | `Herramienta Especializada IMBRA` |
| Línea 2 | Texto que aparece en el botón | `VER HERRAMIENTAS` |
| Línea 3 | URL a donde lleva el botón | `/tienda` |

> ⚠️ **Importante:** La URL debe empezar siempre con `/` (barra diagonal).  
> Ejemplos válidos: `/tienda`, `/categorias/motor`, `/blog`

---

## Cómo se ve cada campo en el slider

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ⚡ TEXTO ALTERNATIVO          ← etiqueta naranja   │
│                                                     │
│  LÍNEA 1 DE DESCRIPCIÓN       ← título grande       │
│                                                     │
│  Título                       ← subtítulo pequeño  │
│                                                     │
│  [ LÍNEA 2 ]  →               ← botón naranja      │
│    (la línea 3 es la URL del botón, no se ve)       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ¿Cuándo aparece en el sitio?

Los cambios se reflejan **inmediatamente** en el home al guardar la imagen en WordPress.

---

## ¿Cómo agrego un segundo slide?

1. Subir otra imagen a la carpeta **Slider** en FileBird
2. Rellenar los mismos 4 campos (Texto alternativo, Título, Leyenda vacía, Descripción)
3. El orden de aparición sigue el **orden de subida**: el más antiguo aparece primero

> Para cambiar el orden, simplemente elimina y vuelve a subir la imagen en el orden deseado.

---

## Resumen rápido (para tener a mano)

| Campo | Uso | Obligatorio |
|-------|-----|-------------|
| **Texto alternativo** | Etiqueta naranja arriba del título | Opcional |
| **Título** | Subtítulo debajo del título grande | Opcional |
| **Leyenda** | No se usa — dejar vacío | — |
| **Descripción** | 3 líneas: título / botón / URL | ✅ Sí |

---

*Documentación generada para el equipo editorial de Imbra Store.*
