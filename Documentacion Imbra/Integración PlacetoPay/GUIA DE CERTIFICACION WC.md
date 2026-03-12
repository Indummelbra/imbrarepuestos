Aquí tienes la extracción completa y detallada del documento PDF, estructurada en formato Markdown, respetando los niveles de encabezado, viñetas y proporcionando descripciones exhaustivas de todos los elementos visuales encontrados.

***

# GUÍA DE CERTIFICACIÓN WC

> *Descripción visual de la portada:*
> *La página de portada tiene un fondo blanco. En la esquina superior derecha y extendiéndose hacia el centro, hay un patrón gráfico compuesto por líneas finas grises que forman hexágonos y redes geométricas, interconectadas por pequeños puntos circulares de color naranja de diferentes tamaños. En la parte central izquierda se encuentra el logotipo de la empresa: un isotipo formado por un enjambre de pequeños puntos naranjas que simulan una esfera o red, seguido de la palabra "evertec" en letras minúsculas de una tipografía sans-serif limpia y de color gris oscuro, con el símbolo de marca registrada (®). Debajo del logo hay una línea separadora naranja. A continuación, el texto principal:*
> *Título: "GUÍA DE CERTIFICACIÓN WC" en letras mayúsculas, negrita y color gris oscuro.*
> *Subtítulo: "Instructivo de uso" en gris claro.*
> *Metadatos: "Febrero 2025" (en color naranja), seguido de una pequeña línea gris y "Versión 1.6" (en gris oscuro).*
> *Nota al pie: "USO CONFIDENCIAL" en mayúsculas, negrita y color gris oscuro. La mitad inferior izquierda de la página repite el mismo patrón geométrico de líneas grises y puntos naranjas de la esquina superior derecha.*

---

## Declaración del Documento

*Este documento fue preparado por, para y se mantendrá bajo la propiedad de Evertec® para su uso confidencial.*

*El cliente acuerda por su aceptación o uso de estos documentos, devolverlos a solicitud de Evertec® y no reproducirlos, copiarlos, prestarlos o de otra forma revelarlos o disponer de sus contenidos, directa o indirectamente y no usarlos para ningún otro propósito que no sea aquel para el cual fueron específicamente preparados.*

---

Nota: Se permite el uso de este documento exclusivamente para fines de instalación de clientes.

Una vez realizada la integración con Placetopay Evertec es necesario realizar pruebas desde la óptica del usuario final para evaluar que el proceso de pago sea correcto; por tanto, los enlaces y datos de pruebas deben estar libres de errores de programación.

A continuación, se describen los diferentes aspectos para tener en cuenta en el proceso de certificación del sitio del comercio con la pasarela de pagos.

Para la certificación WC se evalúan los siguientes puntos:

### 1. USO DE IMPUESTOS
En caso de que dentro de la reglamentación del país y modelo de negocio sea obligatorio el envío de impuestos hacia los bancos, el comercio debe discriminar dichos impuestos de los productos en la transacción. Se debe enviar la base, el tipo de impuesto y el valor del impuesto.

En este punto se validará que el comercio incluya los valores correspondientes dentro de la solicitud de pago y el desglose de impuestos en el checkout del comercio antes de pagar. Para hacer uso de esta funcionalidad debe enviarse cada tipo de impuesto según lo descrito en la documentación [Montos y monedas - Placetopay Docs](#)

### 2. TIEMPO DE EXPIRACIÓN
El tiempo de expiración para realizar el proceso de pago debe estar parametrizado entre 10 a 30 minutos, este valor se puede configurar en el objeto “expiration” al momento de crear una sesión.

### 3. MANEJO DE LIGHTBOX (En caso de utilizar la funcionalidad)
El sistema debe garantizar el correcto funcionamiento transaccional cuando se da la redirección a través de lightbox, debido a que en navegadores como safari o sistemas operativos como iOS se hace un proceso de redirección normal porque no se soporta esta característica, de este modo en el sistema siempre se debe enviar el atributo **returnUrl** y controlar el consumo mediante el método **QuerySession** para brindar un resumen del pago cuando se presente este tipo de escenarios al momento del pago por un usuario.

Documentación técnica: [Lightbox - Placetopay Docs](#)

**Nota:** este servicio únicamente debe ser usado para medios de pago sin redirección interna, es decir en los que sea redirigido al usuario a la interfaz bancaria para realizar el proceso de pago, debido a que esto hace que se pierda la ventana del lightbox y se haga una redirección normal sino encuentra un ambiente propicio para su funcionamiento en la nueva interfaz.

### 4. PROCESAMIENTO TRANSACCIONAL
El sistema le debe permitir al usuario comprador, visualizar el monto total apagar antes de ser redireccionado a la pasarela de pagos, este valor debe de coincidir con el valor enviado a Evertec Placetopay.

El comercio definirá el proceso para realizar el desglose del producto o servicio donde se evalúan los valores e impuesto a cobrar al tarjetahabiente. Puede ser a través de formulario, carrito de compras, tienda virtual, selección de factura u otros.

El sistema debe ser independiente al momento de actualizar el estado de una transacción cuando el usuario retorna desde la interfaz de WC, de este modo siempre que se regrese debe hacerse un consumo al método **QuerySession** para conocer el estado del pago, de acuerdo con lo anterior en el momento que se brinda un resumen de pago y se actualiza la transacción en el sistema del comercio, se debe hacer de forma general en BD manteniendo la trazabilidad acorde al estado dado por Evertec Placetopay.

**Nota:** Para sonda (Cronjob) y notificación (Webhook) únicamente se debe depender de ellos cuando la transacción se encuentra bajo estado PENDIENTE, de lo contrario siempre que haya un estado final APROBADO o RECHAZADO, el sistema debe hacer la actualización de acuerdo con lo especificado en el párrafo anterior.

#### 4.1. CONTROL DEL BOTÓN DE REDIRECCIÓN
Para este ítem se evaluará que al hacer múltiples veces clic al botón para proceder a pagar, solo se realice una petición al servicio esto con el fin de evitar que se creen dobles peticiones, que pueden llegar a generar errores o confusión.

#### 4.2. REINTENTO DE TRANSACCIÓN
En el reintento de una transacción se verifica si el sitio opera a través del estado de la sesión o de la transacción, para brindarle al usuario la información correcta de sus pagos y evitar confusiones en el proceso.

Al reintentar el pago sobre una sesión y obtener un estado diferente del pago, el sitio del comercio debe mostrar el estado del último pago. Se recomienda tomar la información siempre del estado de la sesión, ya que este se ve afectado por transacciones que genera un estado final.

> *Descripción visual de la interfaz de usuario (Mockup de estado de transacciones):*
> *Se muestra una captura de pantalla dividida en dos vistas de una interfaz web, probablemente un panel de usuario o historial de pagos. El diseño es limpio, moderno y de fondo blanco con acentos de color.*
> *1. **Columna Izquierda (Historial de transacciones):** Se ve una línea de tiempo vertical con dos transacciones marcadas. La superior (Paso 2) tiene fecha "Vie, 21 Feb 2025, 16:30:14". Presenta un recuadro delineado en amarillo tenue con un icono de reloj naranja y el texto en naranja "La transacción está pendiente". Abajo, en letras pequeñas, dice "Pendiente, se requiere una revisión adicional para procesar la transacción". Muestra el método de pago (Logo de VISA y terminación •••• 1214), "Total a pagar: $1.000,00", "Autorización / CUS: 000000", "Fecha de transacción", "Dirección IP" y un botón ancho de color verde oscuro que dice "Volver al comercio". Debajo hay otra transacción (Paso 1) del "Vie, 21 Feb 2025, 16:29:47" con un icono rojo de exclamación y el texto rojo "Transacción Rechazada", indicando que el monto excede el máximo permitido. Método de pago: VISA •••• 0057.*
> *2. **Columna Derecha (Detalle lateral/Panel deslizante):** Tiene un fondo completo de color verde manzana. En la parte superior dice "Pago pendiente" y un código "S3286413-T1". Muestra el monto grande "$1.000,00 COP" y "Prueba de pago". Hay un botón delineado para "Imprimir" con el icono de una impresora. Más abajo, bajo el título "Detalle del pago", indica "Referencia: 660508" y "Fecha de solicitud: 2025-02-21 16:29:31". En la esquina inferior derecha aparece el sello "Hecho por placetopay by evertec" y un selector de idioma "Español (Colombia)".*

#### 4.3. URL DE NOTIFICACIÓN
Este proceso tiene la finalidad de informar a su sistema cuando las transacciones cambian de estado pendiente a un estado final. La url de notificación es configurada por el comercio en los puertos 80 o 443 y debe estar programada para recibir una petición tipo POST por parte de Evertec Placetopay, tiene una estructura similar a la siguiente:

> *Descripción visual del fragmento de código JSON:*
> *Una imagen de un bloque de código con fondo gris oscuro (tema oscuro). El texto está coloreado según la sintaxis (claves en azul claro, valores de cadena en naranja). Representa un objeto JSON con la siguiente estructura y datos:*
> ```json
> {
>   "status": {
>     "status": "APPROVED",
>     "message": "Testing notification",
>     "reason": "TT",
>     "date": "2025-02-20T11:24:28-05:00"
>   },
>   "requestId": 3285655,
>   "reference": "250220phhdarGM0g",
>   "signature": "342cfabc5b4407d32b61725a4517577a12fb26db"
> }
> ```

En ella se suministra el mismo **requestId** que se proporcionó cuando se hizo el **CreateSessionRequest**, la referencia proporcionada por el comercio y el estado de la petición que puede ser (APPROVED, REJECTED) para esta notificación.

#### 4.4. CRONJOB O SONDA
Este proceso es una contingencia a la notificación, y consiste en una tarea programada(cronjob) la cual se encarga de consumir el método **QuerySession** (consulta de transacción) sobre las transacciones que quedaron en estado pendiente en los registros de base de datos.

**Nota:** Recuerde configurar en su servidor una tarea programada implementando este método y que corra cada 24 horas verificando las transacciones en estado pendiente, durante el proceso de certificación, se debe ejecutar cada 15 minutos con el fin de validar el proceso de manera ágil.

#### 4.5. VALIDACIÓN CAMPOS CREATESESSIONREQUEST:
El comercio debe como mínimo enviar los siguientes campos requeridos en la solicitud de sesión:

Datos del comprador (buyer opcional):
● Tipo de documento.
● Número de documento.
● Nombre del comprador.
● Apellido del comprador.
● Email del comprador.
● Teléfono celular del comprador.

Datos del pago (payment):
● Referencia
● Descripción (opcional)
● Moneda
● Valor.
● IVA (opcional)
● Base de devolución (opcional)

Datos adicionales
● IP.
● Fecha de expiración (opcional).
● Agente de navegación.
● Url de retorno.

**Importante:** Debe tener en cuenta que cada uno de los campos debe contener información coherente. Adicional a esto, favor basarse en la documentación oficial en caso de cambios: [PlacetoPay Checkout - Placetopay Docs](#)

● Para los datos del comprador (buyer opcional) si se envía se validará que cada uno de los campos que están siendo enviados a Evertec Placetopay estén como requeridos al momento que el usuario está ingresando la información.
● Para la validación del documento si se envía el buyer se deben implementar las restricciones en el campo, de acuerdo con el tipo de documento seleccionado por el usuario, se puede tomar como referencia las validaciones de la documentación: [Tipos de documento - Placetopay Docs](#)
● En caso de que el documento de identidad cuando se envía el buyer pertenezca a una persona natural, para los campos nombre y apellido no se debe de permitir el ingreso de números ni caracteres especiales, sin embargo, debe permitir el ingreso de la tilde, espacios y la letra Ñ. Caso contrario, es decir, empresas se debe enviar solo bajo nombre, la razón social o nombre comercial y para este caso si se debe permitir números.
● Para los campos numéricos como móvil o teléfono cuando se envía el buyer no debe permitir el ingreso de letras, ni caracteres especiales.
● Para el campo email cuando se envía el buyer debe contar con una estructura valida, [usuario/a]@[dominio].[Tipo de origen].[Extensión]
● La referencia enviada a Evertec Placetopay debe ser única por cada transacción o solicitud de pago.
● La referencia es alfanumérica y tiene una longitud máxima de 32 caracteres.
● La dirección IP debe ser la del equipo del usuario final.
● El agente de navegación debe tomarse con una propiedad dependiendo del lenguaje de programación.

En el proceso de paga no siempre el comprador es el mismo titular, por lo que se debe tener en cuenta esta información al momento de enviar estos datos a Evertec Placetopay, para que la información que se envié en estos campos sea consistente y correcta se debe hacer de la siguiente forma:

● El comercio en caso de enviar los datos del comprador únicamente debe enviar el objecto buyer puesto que estos son los datos que se conocen desde el sitio del comercio, Evertec Placetopay solicitará los datos del titular cuando se realice la redirección. En ocasiones el titular y el comprador son la misma persona en este caso se debe preguntar al cliente en el momento del pago si la tarjeta con la que va a pagar es de su propiedad, si la respuesta es SI, se procede a enviar esta información tanto en los campos del comprador como en los campos del titular, en caso de que la respuesta sea NO, solo se enviara los datos del comprador y se dejará que en Evertec Placetopay se solicite la información del titular.

**Nota:** La implementación de preguntar por la propiedad de la tarjeta se considera una buena práctica y es opcional, sin embargo, si el comercio toma la determinación de no implementar esto, debe garantizar que siempre envían la información del comprador y dejar que Placetopay Evertec solicite los datos del titular.

### 5. ENVIO EXTRADATA
Puedes enviar información adicional en las peticiones por medio de extradata. Si dentro del proceso de pago se necesita añadir, por ejemplo, una segunda referencia u otro dato relevante en la sesión. lo puedes realizar por medio de un arreglo de objetos llamado **fields**:

```json
"fields": [
 {
 "keyword": "Numero_matricula",
 "value": "25012023",
 "displayOn": "both"
 },
 {
 "keyword": "Poliza N",
 "value": "1234567",
 "displayOn": "both"
 }
],
```
Para saber más acerca de datos adicionales por favor ingresar a la siguiente documentación: [Campos Adicionales - Placetopay Docs](#)

#### 5.1. CUSTOMER ACCOUNT NUMBER
Si deseas enviar particularmente información adicional sobre una cuenta de cliente donde tenga servicios y que de esta forma es identificado desde tu sistema como un número de cuenta de cliente, debes enviar la extrada de la siguiente manera:

```json
"fields": [
 {
 "keyword": "CustomerAccountNumber",
 "value": "8100312356677",
 "displayOn": "both"
 }
]
```

**Nota:** Las siguientes claves NO son permitidas: _accountNumber, userAgent, fingerprint, sourcePlatform, tokenizationID, trazabilyCode, transactionCycle, RequestId, PartnerAuthCode.

### 6. REVERSO DE TRANSACCIONES & REEMBOLSO DE TRANSACCIONES

#### 6.1. REVERSO
Se debe definir el proceso de reverso de transacciones, en caso de que el comercio vaya a realizar reversos a través del api expuesto por Placetopay Evertec. Se debe confirmar al analista, con el fin de que éste valide la funcionalidad y garantice el correcto funcionamiento, por otra parte, si se va a usar la consola administrativa debe ser informado a través del correo en el hilo del analista encargado.

**Nota:** el reverso solo será posible antes de la hora de conciliación, en caso tal se requiera realizar este proceso posterior a la hora definida, se debe de realizar un reembolso.

#### 6.2. REEMBOLSO
Se debe definir el proceso de reembolso de transacciones, en caso de que el comercio vaya a realizar reembolsos a través del api expuesto por Placetopay Evertec, se debe confirmaral analista, con el fin de que éste valide la funcionalidad y garantice el correcto funcionamiento, por otra parte, si se va a usar la consola administrativa debe ser informado a través del correo en el hilo del analista encargado.

**Nota:** Dependiendo de la fecha de establecidas por la red, el reembolso no se podrá realizar sobre las transacciones para saber más acerca de este ítem por favor comunicarle al analista a cargo para aclarar dudas.

**Importante:** En algunos países se deberá tramitar un reverso extemporáneo con la entidad financiera debido a que la red no cuenta con la funcionalidad de reembolso de las transacciones.

### 7. INFORMACIÓN RELEVANTE

#### 7.1. TARJETAS DE PRUEBA PARA REALIZAR TRANSACCIONES
Por normas PCI no podemos incluir tarjetas de crédito e información adjunta en correos, sin embargo, a través del siguiente enlace pueden visualizar las tarjetas para realizar las pruebas pertinentes: [Números de tarjeta de pruebas - Placetopay Docs](#)

Para pruebas en todas las franquicias:
● Código de verificación: 123
● Fecha de vencimiento de la tarjeta: Seleccione una fecha vigente
● Código OTP: 123456

#### 7.2. DÉBITO A CUENTAS DE AHORRO Y CORRIENTE PSE
Para realizar pruebas con débito a cuenta de ahorro y corriente (PSE) se debe realizar los siguientes pasos:

● **Listar Bancos:** se mostrará la lista de bancos, en la cual se seleccionará el banco que requiera el usuario para realizar su proceso de pago, para efecto de pruebas seleccionar cualquiera.

> *Descripción visual del componente de interfaz (Formulario PSE):*
> *Es un bloque visual que simula un formulario de pago para "Debit account (PSE)". Tiene el logotipo de PSE (un círculo azul con las letras). Muestra un campo "Kind of person" (Tipo de persona) y al lado un menú desplegable abierto con el texto "Select your bank" y una flecha indicando que está expandido.*
> *Dentro del menú desplegable se listan bancos: "BANCO AV VILLAS", seguido de "BANCO UNION COLOMBIANO" (este último está resaltado con un borde de selección naranja que indica que el usuario lo está seleccionando), luego "BANCOLOMBIA", "ITAU", "NEQUI", "Placetopay Bank".*
> *Debajo hay un apartado de "Owner data" (Datos del propietario) con campos para Nombre ("Liliana"), Tipo de documento ("CC") y Número de documento ("1040035000"), seguido de una bandera de Colombia y un número de celular ("+57 300 6108300"). En la parte inferior se observa parcialmente un botón blanco "Back" y un botón naranja.*

> *Descripción visual de la confirmación del formulario de pago:*
> *Esta imagen es la continuación del formulario anterior. Ahora el campo del banco muestra "BANCO UNION COLOM X" seleccionado. Los datos del propietario están completos (Liliana Kassulke, CC 1040035000, celular). En la parte inferior, están alineados dos botones: un botón a la izquierda que dice "<- Back" con texto y flecha gris claro sobre fondo blanco, y un botón de acción principal a la derecha, muy ancho, de color naranja sólido con texto blanco que dice "Pay $ 11,300.00".*

● Una vez realizado este paso se redireccionará al mock de Placetopay Evertec simulando la entidad financiera seleccionada en el paso “Listar Bancos”.

> *Descripción visual de la interfaz del "Mock" de pago (Transacción de prueba):*
> *Se muestra un cuadro sobre un fondo gris claro o beige. En la parte superior hay un título en negrita de color marrón/verde oliva que dice "¡Transacción de prueba!". Debajo, hay un formulario simulado con dos campos desplegables (droplists). El primer campo es "Estado" y el segundo campo es "Razón". En la parte inferior de este recuadro hay un botón ancho de color naranja que dice "Procesar transacción" en letras blancas.*

● Seleccionar del droplist **Estado** para proporcionar el comportamiento transaccional que se desea emular.

> *Descripción visual del menú desplegable "Estado":*
> *Es un acercamiento (zoom) a la interfaz anterior. El campo desplegable "Estado" ha sido clickeado (una flecha naranja apunta a la flecha hacia abajo del droplist). Se ha desplegado un menú de opciones delineado con un grueso borde naranja que contiene las siguientes opciones: "Estado" (en gris, indicando que es el placeholder o valor vacío inicial), "Aprobada", "Pendiente", "Declinada" y "Fallido".*

● Una vez seleccionado el estado, se debe elegir un motivo de respuesta acorde al estado transaccional que se haya previamente seleccionado.

> *Descripción visual del menú desplegable "Razón":*
> *Se muestra la misma interfaz, pero ahora el menú desplegable "Razón" está abierto. Hay un cuadro largo delineado en naranja con una barra de desplazamiento lateral a la derecha. La lista contiene numerosos códigos de respuesta técnica en texto gris, tales como: APPROVED_TRANSACTION (00), APPROVED_VIP (11), PENDING_TRANSACTION (?-), PENDING_VALIDATION (?*), CANCELLED_TRANSACTION (?C), MANUAL_CANCELLATION (VR), INVALID_RESPONSE (XR), BANNED_PINPAD (?4), BANNED_AVS (?3), BANNED_RISK (?2), BANNED_EXPIRED (?5), BANNED_DATETIME (?1), INVALID_AMOUNT (XA), INVALID_CURRENCY (XC), INVALID_FRANCHISE (XF), INVALID_PLATFORM (X2), INVALID_REQUEST (X3), INVALID_GATEWAY (XG), INVALID_LANGUAGE (XL). Una flecha naranja señala el recuadro que se debe expandir. Debajo de todo está el botón naranja "Procesar transacción".*

● Mostrar respuesta: una vez finalizada la operación se presentará la respuesta de PSE en la página de webcheckout de Placetopay Evertec:

> *Descripción visual de los comprobantes de pago exitosos:*
> *Se muestran dos capturas de pantalla de recibos de pago digital, similares en diseño general pero con sutiles diferencias de layout (una vista móvil vs una vista de tarjeta de detalle lateral).*
> *1. **Captura Izquierda:** Un recibo con el logotipo de "placetopay by evertec" en la parte superior central. Más abajo, dentro de una tarjeta blanca con un borde sutil, hay un círculo verde con una marca de verificación blanca (check) y el texto verde "Approved transaction". Debajo, "Payment method" muestra el logo de PSE y el texto "Cuentas débito ahorro y corriente (PSE)". Presenta datos en dos columnas: "Total paid: $ 11,300.00", "Bank: BANCO UNION COLOMBIANO", "Authorization / CUS: 123", "Transaction date: 2023-10-20 22:26:53", "Receipt: 1597317690", "IP address: 186.80.28.28", "Response code: 00". Un botón naranja largo cruza la parte inferior con el texto "Back to merchant". Al final, un pequeño texto: "The voucher will be sent to dnetix@yopmail.com". El recibo tiene un borde inferior tipo ticket dentado.*
> *2. **Captura Derecha:** Un panel vertical que parece un detalle lateral de una aplicación. Arriba a la derecha tiene un número de referencia "S2660945-T1". El título es "Total paid" y el monto principal es "$ 11,300.00 COP". Debajo dice "processing payment". Hay un botón redondeado delineado gris para "Imprimir". Le sigue un acordeón titulado "Payment details" desplegado, que muestra "Reference: TESTING_2_PAYMENT" y "Request date: 2023-10-20 22:24:08". En la parte inferior, información de estado temporal ("The process has been finished 5 minutes ago") y de ayuda ("Get help at pruebasp2p2016@gmail.com"). También incluye el sello "Made by placetopay by evertec".*

### 8. RECOMENDACIONES PARA LA IMPLEMENTACIÓN
Los siguientes puntos son recomendaciones para ser implementadas por los comercios, con el objetivo de optimizar la experiencia del usuario final.

#### 8.1. HISTÓRICO TRANSACCIONAL
Se recomienda implementar un histórico de pagos que permita consultar el estado de por lo menos las últimas cinco (5) transacciones realizadas. Cada registro debe contener como mínimo los siguientes datos ordenados de forma descendente por fecha:

• Fecha y hora de la transacción.
• Número de referencia (emitida por el comercio).
• Autorización/CUS. (opcional)
• Estado de la transacción.
• Valor (debe estar concatenado con el tipo de moneda según ISO 4217).

> *Descripción visual de la tabla "Histórico Transaccional":*
> *Una tabla pequeña que ilustra cómo se debe ver el histórico de pagos recomendado. La tabla tiene una fila de encabezado con fondo naranja brillante y texto blanco, y filas de datos con colores de fondo alternados (blanco y gris muy claro). Los textos están centrados. Los colores exactos no se detallan en código, pero es un esquema clásico de cebra con encabezado cálido.*

| FECHA Y HORA | REFERENCIA | ESTADO | AUTORIZACIÓN/CUS | VALOR |
| :--- | :---: | :---: | :---: | :---: |
| 31/01/2022 6:50 p. m. | ORDEN_515 | PENDIENTE | 5555 | USD $200 |
| 31/01/2022 1:00 p. m. | ORDEN_501 | APROBADO | 5439 | USD $289 |
| 30/01/2022 10:59 a. m. | ORDEN_459 | RECHAZADO | 5276 | USD $76 |

#### 8.2. REQUERIMIENTOS DE SEGURIDAD
Los datos de configuración de la conexión de Placetopay Evertec como login y secretkey, deben ser almacenados como parámetros ya sea en la base de datos, en algún archivo env, xml, ini, json, etc, Esto se debe hacer por buenas prácticas de seguridad y para que al momento de actualizar la llave el proceso sea más sencillo.

Para los sitios que usan validaciones con JavaScript se debe evitar que se afecte la operación cuando se ingresa desde un navegador que tiene deshabilitada la ejecución de JavaScript. Puede ser evitando la carga de la página o realizando validación del lado del servidor.

Se recomienda implementar contraseña cifrada en AES256 para realizar la autenticación de los usuarios en el sitio del comercio.

#### 8.3. MANEJO DE RESPUESTAS PARA ESTADOS TRANSACCIONALES
Al momento que el usuario culmine su proceso de pago ya sea Aprobado, Rechazado o Pendiente, y de clic en el botón “Regresar al comercio” ó “No deseo continuar”, se debe mostrar el detalle de la transacción, como recomendación deben visualizarse los siguientes datos:

● Referencia. (Obligatorio)
● Estado final de transacción (Obligatorio):
  ❖ Aprobado
  ❖ Rechazado
  ❖ Pendiente
  ❖ Fallido
● Fecha y hora.
● Valor total.
● Moneda con la cual se realizó el pago.

**Importante:** al regresar al comercio en caso de que se dé clic en no deseo continuar con el proceso en la interfaz de webcheckout, se debe mostrar un resumen tal cual se indica en el paso anterior, ya sea que se esté haciendo uso del returnUrl o cancelUrl en la petición hacía webcheckout.

**Nota:** se debe presentar la fecha y hora en un formato visual para el usuario y no en el formato ISO con el cual responde Placetopay Evertec.

#### 8.4. LOGOTIPO DE PLACETOPAY
El sistema donde se realizó la integración debe de mostrar al usuario el logo de Placetopay Evertec, este logo se puede tomar de alguna de las siguientes URL’s:

● https://static.placetopay.com/placetopay-logo.svg
● https://static.placetopay.com/placetopay-logo-dark-background.svg
● https://static.placetopay.com/placetopay-logo-square.svg
● https://static.placetopay.com/placetopay-logo-square-dark-background.svg

También se sugiere agregar los logotipos de las franquicias disponibles para hacer pagos, a fin de que el cliente tenga conocimiento de los medios de pago habilitados para el comercio y contener un hipervínculo a nuestra página principal informativa: https://www.placetopay.com/web/

#### 8.5. PREGUNTAS FRECUENTES, TÉRMINOS, CONDICIONES Y POLÍTICAS DE PRIVACIDAD
Se debe incluir dentro de un apartado del sitio, una sección de preguntas frecuentes (FAQ) y mencionar los pagos a través de Placetopay Evertec. En caso de que el comercio no cuente con una sección de FAQ, se deben incluir de igual forma las preguntas frecuentes proporcionadas en la documentación.

Para garantizar la transparencia y el cumplimiento de las normativas aplicables, el comercio debe establecer Términos y Condiciones claros y una política de gestión de información del usuario accesible, adicionalmente estos de deben añadir antes de realizar el pago o en un apartado del aplicativo por ejemplo en el pie de página, etc... Estos deben cumplir con los siguientes lineamientos:

● Los T&C deben ser visibles para el usuario antes de procesar el pago.
● Se disponen 2 checks, uno para lo T&C y el otro para las políticas de privacidad donde textualmente se indique al usuario en primer check “sí, acepto términos y condiciones” y en el segundo “sí, acepto políticas de privacidad” (Aplica principalmente Ecuador).
● El comercio debe permitir al usuario consultar y aceptar las condiciones generales de manera explícita antes de finalizar la compra. De acuerdo con el ítem anterior los checks deben contener un hipervínculo hacia la política que se está aceptando (Aplica principalmente Ecuador).
● El comercio es responsable de definir los términos y condiciones generales que regulen sus operaciones.

### 9. CONSIDERACIONES
Para el proceso de certificación se debe de enviar la información al analista asignado de Placetopay Evertec con los siguientes datos:

● URL de pruebas: El sitio habilitado para realizar la revisión y certificación
● Usuario y clave: Datos de acceso para el ingreso y simulación del pago.
● Todos los ejemplos de las peticiones lo podrán visualizar en la documentación [Sesión - Placetopay Docs](#)