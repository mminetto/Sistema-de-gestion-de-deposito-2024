/* Aplicación local: scripts clásicos para permitir abrir index.html con doble clic. */
$(function () {
    'use strict';
    const store = DepositoStore.createStore({
        getItem: key => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value)
    });
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
    let action = 'ingreso', pending = [], page = '', available = true;
    const fields = {codigo_barras: 'barcode', categoria: 'categoria', modelo: 'modelo', tipo: 'types', estado: 'states', ubicacion: 'locations', cantidad: 'cantidad', unidad: 'units', stock_critico: 'stock_critico'};
    const labels = {tipo: 'Tipo', estado: 'Estado', unidad: 'Unidad', ubicacion: 'Ubicación', seccion: 'Sección del responsable'};
    function notify(message, error = false) {
        $('#formalert').text(message).removeClass('d-none alert-success alert-danger').addClass(error ? 'alert-danger' : 'alert-success');
    }
    function run(fn) {
        try { return fn(); } catch (error) { notify(error.message, true); if (!$('#actionModal').hasClass('show')) alert(error.message); }
    }
    function fillOptions() {
        const data = store.read();
        for (const [key, id] of Object.entries({tipo: 'types', estado: 'states', unidad: 'units', ubicacion: 'locations', seccion: 'seccion'})) {
            const select = $('#' + id), selected = select.val();
            select.empty().append(new Option(labels[key], ''));
            data.values[key].forEach(value => select.append(new Option(value, value)));
            if (selected) select.val(selected);
        }
        $('#categories').empty();
        [...new Set(data.items.map(x => x.categoria))].forEach(x => $('#categories').append(new Option(x, x)));
        $('#models').empty();
        [...new Set(data.items.map(x => x.modelo))].forEach(x => $('#models').append(new Option(x, x)));
    }
    function selectItem(item) {
        for (const [key, id] of Object.entries(fields)) {
            const input = $('#' + id);
            if (input.is('select') && !Array.from(input[0].options).some(o => o.value === item[key])) input.append(new Option(item[key], item[key]));
            input.val(key === 'cantidad' ? '' : item[key]);
        }
        $('#basic-addon2').text(item.cantidad);
        $('#search-results-container').hide();
        $('#cantidad').trigger('focus');
    }
    function resetProduct() {
        $('#ingresoForm')[0].reset(); $('#barcode').val(''); $('#basic-addon2').text('stock');
        $('#ingresoForm').removeClass('was-validated');
    }
    function listPending() {
        $('#confirmed-items-container').html(pending.map((item, i) => `<li class="list-group-item confirmed-item p-1"><div class="card-body"><h7 class="card-title">${esc(item.codigo_barras)}<br><strong>${item.cantidad} - ${esc(item.unidad)}</strong></h7><p class="card-text">${esc(item.categoria)} - ${esc(item.modelo)}</p><button type="button" class="btn btn-warning btn-sm" data-edit="${i}">Editar</button> <button type="button" class="btn btn-danger btn-sm" data-remove="${i}">Eliminar</button></div></li>`).join(''));
    }
    $('#confirmed-items-container').on('click', '[data-remove]', function () { pending.splice(Number(this.dataset.remove), 1); listPending(); });
    $('#confirmed-items-container').on('click', '[data-edit]', function () {
        const item = pending.splice(Number(this.dataset.edit), 1)[0]; selectItem(item); $('#cantidad').val(item.cantidad); listPending();
        $('#userFormDiv').addClass('d-none'); $('#scont').removeClass('d-none');
    });
    $('#ingresobtn, #retirarbtn').on('click', function () {
        action = this.id === 'ingresobtn' ? 'ingreso' : 'retiro'; pending = []; listPending(); resetProduct();
        $('#ModalLabel').empty().append($(this).find('svg').first().clone()).append(document.createTextNode(action === 'ingreso' ? ' Ingresar Item' : ' Retirar Item'));
        $('#content-modal').removeClass('border-ingresar border-retirar').addClass(action === 'ingreso' ? 'border-ingresar' : 'border-retirar');
        $('#formalert, #userFormDiv').addClass('d-none'); $('#scont').removeClass('d-none');
        $('#userForm')[0].reset(); $('#userForm').removeClass('was-validated');
        $('#generate-code').prop('disabled', action === 'retiro');
        run(fillOptions);
    });
    $('#generate-code').on('click', () => run(() => {
        const used = new Set([...store.read().items, ...pending].map(x => x.codigo_barras));
        let code;
        do { const bytes = new Uint32Array(2); crypto.getRandomValues(bytes); code = Array.from(bytes, x => String(x % 1000000).padStart(6, '0')).join(''); } while (used.has(code));
        $('#barcode').val(code);
    }));
    $('#barcode').on('input change', () => run(() => {
        const item = store.read().items.find(x => x.codigo_barras === $('#barcode').val().trim());
        if (item) selectItem(item); else $('#basic-addon2').text('stock');
    })).on('keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); $(this).trigger('change'); } });
    $('#search').on('input', function () {
        const query = this.value.trim().toLocaleLowerCase();
        const results = store.read().items.filter(x => [x.codigo_barras, x.categoria, x.modelo].some(v => v.toLocaleLowerCase().includes(query)));
        $('#search-results').empty();
        results.slice(0, 30).forEach(item => $('<button type="button" class="web-result">').text(`${item.categoria} - ${item.modelo} | ${item.codigo_barras} | Stock: ${item.cantidad}`).on('click', () => selectItem(item)).appendTo('#search-results'));
        if (!results.length) $('#search-results').text('No se encontraron productos.');
        $('#search-results-container').toggle(Boolean(query));
    });
    $('#addItem').on('click', () => run(() => {
        const form = $('#ingresoForm')[0]; form.classList.add('was-validated');
        if (!form.checkValidity() || !$('#barcode').val().trim()) throw Error('Completá todos los campos del producto.');
        const item = Object.fromEntries(Object.entries(fields).map(([key, id]) => [key, $('#' + id).val().trim()]));
        item.cantidad = Number(item.cantidad); item.stock_critico = Number(item.stock_critico);
        if (!Number.isSafeInteger(item.cantidad) || item.cantidad <= 0 || !Number.isSafeInteger(item.stock_critico) || item.stock_critico < 0) throw Error('Ingresá cantidades enteras válidas.');
        if (pending.some(x => x.codigo_barras === item.codigo_barras)) throw Error('Ese producto ya está en el listado. Podés editar su cantidad.');
        const existing = store.read().items.find(x => x.codigo_barras === item.codigo_barras);
        if (action === 'retiro' && (!existing || existing.cantidad < item.cantidad)) throw Error('El producto no existe o no tiene stock suficiente.');
        if (existing && ['categoria', 'modelo', 'unidad'].some(k => existing[k] !== item[k])) throw Error('El código ya identifica otro producto. Seleccionalo desde la búsqueda.');
        pending.push(item); listPending(); resetProduct(); $('#formalert').addClass('d-none');
    }));
    $('#confirmItems').on('click', () => {
        if (!pending.length) return notify('Agregá al menos un ítem al listado.', true);
        $('#scont').addClass('d-none'); $('#userFormDiv').removeClass('d-none');
    });
    $('#backToItemsForm').on('click', () => { $('#scont').removeClass('d-none'); $('#userFormDiv').addClass('d-none'); });
    $('#user-search').on('input', function () {
        const query = this.value.toLocaleLowerCase(); $('#user-search-results').empty();
        store.read().users.filter(u => `${u.nombre} ${u.apellido} ${u.dni}`.toLocaleLowerCase().includes(query)).slice(0, 20).forEach(user => {
            $('<button type="button" class="web-result">').text(`${user.nombre} ${user.apellido} · ${user.dni}`).on('click', () => {
                for (const key of ['nombre', 'apellido', 'telefono', 'email', 'dni', 'seccion']) {
                    if (key === 'seccion' && !Array.from($('#seccion')[0].options).some(x => x.value === user[key])) $('#seccion').append(new Option(user[key], user[key]));
                    $('#' + key).val(user[key]);
                }
                $('#user-search-results-container').hide();
            }).appendTo('#user-search-results');
        });
        $('#user-search-results-container').toggle(Boolean(query));
    });
    $('#submitUserForm').on('click', () => run(() => {
        const form = $('#userForm')[0]; form.classList.add('was-validated');
        if (!form.checkValidity()) throw Error('Completá los datos del responsable y un email válido.');
        const user = Object.fromEntries(['nombre', 'apellido', 'telefono', 'email', 'dni', 'seccion'].map(key => [key, $('#' + key).val().trim()]));
        store.move(action, pending, user);
        pending = []; listPending(); render(); fillOptions();
        bootstrap.Modal.getInstance($('#actionModal')[0]).hide();
    }));
    $('form').on('submit', event => event.preventDefault());
    function printReceipt(op) {
        let area = document.getElementById('print-area');
        if (!area) { area = document.createElement('section'); area.id = 'print-area'; document.body.appendChild(area); }
        area.innerHTML = `<h1>Depósito escolar</h1><h2>Remito de ${op.action === 'ingreso' ? 'ingreso' : 'retiro'}</h2><p>N.º ${esc(op.id)} · ${esc(new Date(op.date).toLocaleString('es-AR'))}</p><p>Responsable: ${esc(op.user.nombre)} ${esc(op.user.apellido)} · DNI ${esc(op.user.dni)}</p><table><thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th></tr></thead><tbody>${op.items.map(i => `<tr><td>${esc(i.codigo_barras)}</td><td>${esc(i.categoria)} - ${esc(i.modelo)}</td><td>${i.cantidad} ${esc(i.unidad)}</td></tr>`).join('')}</tbody></table><p style="margin-top:70px">Firma: __________________________</p>`;
        const labels = document.createElement('div'); labels.className = 'receipt-labels';
        labels.innerHTML = '<h2>Etiquetas para recortar</h2><p>Imprimir al 100% y recortar por la línea punteada.</p>';
        for (const item of [...new Map(op.items.map(i => [i.codigo_barras, i])).values()]) {
            const label = document.createElement('div'); label.className = 'receipt-label';
            const title = document.createElement('p'); title.textContent = item.categoria + ' - ' + item.modelo;
            const canvas = DepositoReceipts.barcode(item.codigo_barras);
            const img = document.createElement('img'); img.src = canvas.toDataURL(); img.alt = item.codigo_barras;
            const width = Math.max(75, canvas.width / 3 * 0.25);
            if (width > 166) throw Error('Código demasiado largo para imprimir una etiqueta legible.');
            img.style.width = width + 'mm'; img.style.height = '24mm';
            const code = document.createElement('p'); code.textContent = item.codigo_barras;
            label.append(title, img, code); labels.appendChild(label);
        }
        area.appendChild(labels);
        Promise.all(Array.from(labels.querySelectorAll('img'), img => img.decode())).then(() => window.print());
    }
    function renderInventory(query = '') {
        const data = store.read(), target = $('#inventory-list').empty();
        const items = data.items.filter(x => [x.codigo_barras, x.modelo, x.categoria, x.ubicacion].some(v => v.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
        if (!items.length) target.append('<p class="web-empty">No hay productos para mostrar. Usá Ingresar para registrar el primero.</p>');
        for (const item of items) {
            const row = $('<div class="operation-item">').html(`<div class="operation-details"><strong class="item-category">${esc(item.categoria)}</strong> - ${esc(item.modelo)}<div>${esc(item.codigo_barras)} · ${esc(item.ubicacion)} · ${esc(item.estado)}</div><span class="${item.cantidad <= item.stock_critico ? 'web-low' : ''}">Stock: ${item.cantidad} ${esc(item.unidad)}${item.cantidad <= item.stock_critico ? ' · Stock bajo' : ''}</span></div>`);
            $('<button class="web-button">Retirar</button>').prop('disabled', item.cantidad === 0).on('click', () => { $('#retirarbtn')[0].click(); selectItem(item); }).appendTo(row);
            target.append(row);
        }
    }
    function render() {
        if (!available) return;
        const data = store.read(); page = location.hash.slice(1) || 'historial';
        if (!['historial', 'busqueda', 'analiticas', 'configuracion'].includes(page)) page = 'historial';
        $('li[data-page] > a').removeClass('active-btn'); $(`li[data-page="${page}"] > a`).addClass('active-btn');
        const content = $('#page-content').empty();
        if (page === 'historial') {
            if (!data.operations.length) content.html('<div class="web-empty"><h3>Historial</h3><p>Todavía no hay movimientos. Seleccioná Ingresar para dar de alta tus productos.</p></div>');
            let date = '';
            for (const op of data.operations) {
                const day = new Date(op.date).toLocaleDateString('es-AR');
                if (day !== date) { $('<h3>').text(day).appendTo(content); date = day; }
                const row = $('<div class="operation-item">');
                $('<div class="operation-left-icon">').append($(op.action === 'ingreso' ? '#ingresobtn svg' : '#retirarbtn svg').first().clone()).appendTo(row);
                $('<div class="operation-details">').html(op.items.map(i => `<div><span class="item-category">${esc(i.categoria)}</span> - ${esc(i.modelo)} · ${i.cantidad} ${esc(i.unidad)}</div>`).join('') + `<div class="operation-user-date">${op.action === 'ingreso' ? 'Ingreso' : 'Retiro'} · ${esc(op.user.nombre)} ${esc(op.user.apellido)} | ${esc(new Date(op.date).toLocaleTimeString('es-AR'))}</div>`).appendTo(row);
                $('<button class="web-button">Remito</button>').on('click', () => DepositoReceipts.open(op, printReceipt)).appendTo(row); content.append(row);
            }
        } else if (page === 'busqueda') {
            content.html('<div class="web-toolbar"><input id="inventory-search" class="form-control" placeholder="Buscar por producto, categoría, código o ubicación" aria-label="Buscar productos"></div><div id="inventory-list"></div>');
            $('#inventory-search').on('input', function () { renderInventory(this.value); }); renderInventory();
        } else if (page === 'analiticas') {
            content.html(`<h3>Analíticas</h3><div class="operation-item">${data.items.length} productos registrados · ${data.operations.length} movimientos · ${data.users.length} responsables</div><h4>Stock bajo</h4>`);
            const low = data.items.filter(i => i.cantidad <= i.stock_critico);
            if (!low.length) content.append('<p>No hay productos con stock bajo.</p>');
            low.forEach(i => $('<div class="operation-item web-low">').text(`${i.categoria} - ${i.modelo}: ${i.cantidad} ${i.unidad} (mínimo: ${i.stock_critico})`).appendTo(content));
        } else {
            content.html('<h3>Configuración</h3><p>Los datos se guardan en este navegador. Exportá un respaldo para conservarlos o trasladarlos.</p><div class="web-toolbar"><button id="export-backup" class="web-button">Exportar respaldo</button><label class="web-button">Importar respaldo<input id="import-backup" type="file" accept=".json,application/json" hidden></label></div><div id="settings-values"></div>');
            $('#export-backup').on('click', () => {
                const url = URL.createObjectURL(new Blob([JSON.stringify(store.read(), null, 2)], {type: 'application/json'}));
                const link = document.createElement('a'); link.href = url; link.download = 'deposito-respaldo-' + new Date().toISOString().slice(0, 10) + '.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
            $('#import-backup').on('change', async function () {
                const file = this.files[0]; if (!file) return;
                try { const backup = DepositoStore.validate(JSON.parse(await file.text())); if (confirm(`Se reemplazarán los datos actuales por ${backup.items.length} productos y ${backup.operations.length} movimientos del respaldo. ¿Continuar?`)) { store.restore(backup); render(); fillOptions(); } } catch (e) { alert('No se importó el respaldo: ' + e.message); }
            });
            for (const key of Object.keys(labels)) {
                const box = $('<div class="campo mb-4">').append($('<h4>').text(labels[key]));
                const values = $('<div class="operation-item flex-column">').appendTo(box);
                data.values[key].forEach(value => {
                    const row = $('<div class="d-flex justify-content-between w-100 align-items-center mb-2">').append($('<span>').text(value));
                    $('<button class="btn btn-danger btn-sm">Eliminar</button>').on('click', () => run(() => { const next = store.read(); next.values[key] = next.values[key].filter(x => x !== value); store.save(next); render(); fillOptions(); })).appendTo(row); values.append(row);
                });
                $('<button class="web-button">Agregar</button>').on('click', () => run(() => { const value = prompt('Nuevo valor para ' + labels[key])?.trim(); if (!value) return; const next = store.read(); if (next.values[key].includes(value)) throw Error('El valor ya existe.'); next.values[key].push(value); store.save(next); render(); fillOptions(); })).appendTo(box);
                $('#settings-values').append(box);
            }
        }
    }
    window.addEventListener('hashchange', () => run(render));
    window.addEventListener('storage', () => run(() => { render(); fillOptions(); }));
    try {
        // Probe storage before accepting any inventory operation.
        localStorage.setItem('deposito-storage-check', '1'); localStorage.removeItem('deposito-storage-check');
        store.read(); fillOptions(); render();
    } catch (error) {
        available = false;
        $('#page-content').text('No se puede acceder a los datos guardados. No se sobrescribió el inventario. Abrí la página en un navegador con almacenamiento habilitado. Detalle: ' + error.message);
        $('#ingresobtn, #retirarbtn').removeAttr('data-bs-toggle').on('click', event => event.preventDefault());
    }
});
