# Sistema de Gestión de Depósito Escolar

Proyecto desarrollado originalmente en el secundario para administrar los productos del depósito del colegio. Esta versión web conserva el diseño original y permite registrar ingresos, retiros y consultar el stock desde el navegador.

## Cómo usarlo

1. Descargá el proyecto y descomprimí la carpeta.
2. Abrí `index.html` con doble clic.
3. Usá **Ingresar** para registrar productos o **Retirar** para descontar existencias. Agregá los ítems y confirmá los datos del responsable para guardar el movimiento.

No requiere instalar Python, iniciar un servidor ni tener conexión a Internet. Mantené las carpetas `static` y `recursos` junto a `index.html`.

## Funciones

- Registro de ingresos y retiros, con control del stock disponible.
- Búsqueda de productos por nombre, categoría, código o ubicación.
- Historial de movimientos y responsables.
- Alertas de stock bajo.
- Descarga e impresión de remitos en PDF.
- Etiquetas recortables con códigos de barras, incluidas en el remito o en un PDF aparte.
- Exportación e importación de respaldos desde **Configuración**.

Para descargar un remito o sus etiquetas, entrá a **Historial → Remito**. Imprimí las etiquetas al 100% para conservar su tamaño.

## Guardado de datos

Los datos se guardan en el navegador del equipo y permanecen al cerrar la página. Usá el mismo navegador, perfil y ubicación del proyecto; el inventario no se sincroniza entre computadoras.

**Exportá respaldos desde Configuración** antes de borrar los datos del navegador, mover el proyecto o cambiar de equipo. Evitá usar el modo incógnito.

## Tecnologías

HTML, CSS y JavaScript, con Bootstrap, jQuery, jsPDF y JsBarcode. El almacenamiento local utiliza `localStorage`.

Los archivos de la versión original en Python y Flask se conservan como referencia; no son necesarios para ejecutar la versión web.
