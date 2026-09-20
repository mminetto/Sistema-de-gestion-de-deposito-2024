/* PDF y códigos locales: no se envían datos a servicios externos. */
(function () {
    'use strict';
    function barcode(code) {
        const canvas = document.createElement('canvas');
        try {
            JsBarcode(canvas, code, {format: 'CODE128', width: 3, height: 110, margin: 30, displayValue: false, background: '#ffffff', lineColor: '#000000'});
        } catch (_) { throw Error('No se puede generar el código de barras de "' + code + '". Usá un identificador con caracteres ASCII imprimibles.'); }
        return canvas;
    }
    function createPDF(op, labelsOnly = false) {
        // Validate every code before creating a partial document.
        const items = [...new Map(op.items.map(item => [item.codigo_barras, item])).values()];
        const images = items.map(item => barcode(item.codigo_barras));
        const doc = new jspdf.jsPDF({unit: 'mm', format: 'a4'});
        doc.setProperties({title: (labelsOnly ? 'Etiquetas ' : 'Remito ') + op.id, author: 'Depósito escolar'});
        let y = 20;
        function text(value, size = 11, indent = 15, width = 180) {
            doc.setFontSize(size);
            const lines = doc.splitTextToSize(String(value), width);
            for (const line of lines) {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(line, indent, y); y += size * 0.45 + 1;
            }
        }
        if (!labelsOnly) {
            text('DEPÓSITO ESCOLAR', 20);
            text('Remito de ' + (op.action === 'ingreso' ? 'ingreso' : 'retiro'), 16);
            text('N.º ' + op.id + ' | ' + new Date(op.date).toLocaleString('es-AR'));
            y += 5;
            text('Responsable: ' + op.user.nombre + ' ' + op.user.apellido);
            text('DNI: ' + (op.user.dni || '') + ' | Sección: ' + (op.user.seccion || ''));
            y += 7;
            for (const item of op.items) {
                if (y > 240) { doc.addPage(); y = 20; }
                doc.setDrawColor(180); doc.line(15, y - 3, 195, y - 3);
                text(item.categoria + ' - ' + item.modelo, 12);
                text('Código: ' + item.codigo_barras);
                text('Cantidad: ' + item.cantidad + ' ' + item.unidad);
                y += 6;
            }
            y += 12; text('Firma: __________________________________');
            doc.addPage();
        }
        const heading = () => {
            doc.setFontSize(16); doc.text('Etiquetas de productos', 15, 18);
            doc.setFontSize(9); doc.text('Remito ' + op.id + ' | Recortar por la línea punteada. Imprimir al 100%.', 15, 25);
        };
        heading(); y = 34;
        items.forEach((item, i) => {
            const canvas = images[i];
            // Keep bars at least 0.25 mm wide; very long codes get an explicit error.
            const width = Math.max(75, canvas.width / 3 * 0.25);
            if (width > 166) throw Error('El código ' + item.codigo_barras + ' es demasiado largo para una etiqueta A4 legible.');
            doc.setFontSize(11);
            const title = doc.splitTextToSize(item.categoria + ' - ' + item.modelo, 162);
            const codeLines = doc.splitTextToSize(item.codigo_barras, 162);
            const height = 43 + title.length * 5 + codeLines.length * 4;
            if (height > 230) throw Error('El nombre del producto es demasiado largo para imprimir una etiqueta.');
            if (y + height > 278) { doc.addPage(); heading(); y = 34; }
            doc.setDrawColor(130); doc.setLineDashPattern([2, 2], 0); doc.rect(15, y, 180, height); doc.setLineDashPattern([], 0);
            doc.text(title, 24, y + 8);
            const imageY = y + 12 + title.length * 5;
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', (210 - width) / 2, imageY, width, 24);
            doc.setFontSize(10); doc.text(codeLines, 105, imageY + 29, {align: 'center'});
            y += height + 5;
        });
        const count = doc.getNumberOfPages();
        for (let i = 1; i <= count; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(100); doc.text(`Página ${i} de ${count}`, 195, 289, {align: 'right'}); }
        return doc;
    }
    function open(op, print) {
        let modal = document.getElementById('receipt-modal');
        if (!modal) {
            modal = document.createElement('div'); modal.id = 'receipt-modal'; modal.className = 'modal fade'; modal.tabIndex = -1;
            modal.setAttribute('aria-labelledby', 'receipt-title');
            modal.innerHTML = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 id="receipt-title" class="modal-title">Remito y etiquetas</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div><div class="modal-body"><p>El PDF del remito incluye una hoja de etiquetas recortables con el código de barras de cada producto.</p><div class="d-flex flex-column gap-3"><button class="web-button" id="receipt-pdf">Descargar remito PDF</button><button class="web-button" id="labels-pdf">Descargar solo etiquetas PDF</button><button class="web-button" id="receipt-print">Imprimir remito</button></div><p id="receipt-error" role="alert" class="text-warning mt-3"></p></div></div></div>';
            document.body.appendChild(modal);
        }
        modal.querySelector('#receipt-error').textContent = '';
        const download = labels => {
            try { createPDF(op, labels).save((labels ? 'etiquetas-' : 'remito-') + op.id.replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf'); }
            catch (e) { modal.querySelector('#receipt-error').textContent = e.message; }
        };
        modal.querySelector('#receipt-pdf').onclick = () => download(false);
        modal.querySelector('#labels-pdf').onclick = () => download(true);
        modal.querySelector('#receipt-print').onclick = () => {
            try { print(op); } catch (e) { modal.querySelector('#receipt-error').textContent = e.message; }
        };
        bootstrap.Modal.getOrCreateInstance(modal).show();
    }
    window.DepositoReceipts = {open, createPDF, barcode};
})();
