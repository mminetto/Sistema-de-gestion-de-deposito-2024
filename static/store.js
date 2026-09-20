(function (root) {
    'use strict';
    const KEY = 'deposito-escolar-v1';
    const defaults = () => ({version: 1, items: [], users: [], operations: [], values: {
        tipo: ['Herramienta', 'Insumo'], estado: ['Nuevo', 'Usado', 'Reparación', 'Disponible', 'Obsoleto'],
        unidad: ['Unidades', 'Kg', 'Litros', 'Metros', 'Piezas'],
        ubicacion: ['Sector A', 'Sector B', 'Sector C'], seccion: ['Sector 1', 'Sector 2', 'Sector 3']
    }});
    const clone = x => JSON.parse(JSON.stringify(x));
    function validate(data) {
        if (!data || data.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.users) || !Array.isArray(data.operations)) throw Error('El archivo no es un respaldo válido.');
        const codes = new Set();
        for (const item of data.items) {
            for (const key of ['codigo_barras', 'categoria', 'modelo', 'tipo', 'estado', 'unidad', 'ubicacion']) {
                if (typeof item[key] !== 'string' || !item[key].trim()) throw Error('Hay productos incompletos.');
            }
            if (codes.has(item.codigo_barras)) throw Error('Código duplicado.');
            codes.add(item.codigo_barras);
            if (!Number.isSafeInteger(item.cantidad) || item.cantidad < 0 || !Number.isSafeInteger(item.stock_critico) || item.stock_critico < 0) throw Error('Stock inválido.');
        }
        for (const key of Object.keys(defaults().values)) {
            if (!Array.isArray(data.values?.[key]) || !data.values[key].every(x => typeof x === 'string' && x.trim())) throw Error('Configuración inválida.');
        }
        for (const user of data.users) if (!user || !['nombre', 'apellido', 'dni', 'seccion'].every(k => typeof user[k] === 'string' && user[k].trim())) throw Error('Usuario inválido.');
        for (const op of data.operations) {
            if (!op || typeof op.id !== 'string' || !['ingreso', 'retiro'].includes(op.action) || !Number.isFinite(Date.parse(op.date)) || !op.user || typeof op.user.nombre !== 'string' || typeof op.user.apellido !== 'string' || !Array.isArray(op.items) || !op.items.length) throw Error('Historial inválido.');
            for (const item of op.items) if (!item || !Number.isSafeInteger(item.cantidad) || item.cantidad <= 0 || !['codigo_barras', 'modelo', 'categoria', 'unidad'].every(k => typeof item[k] === 'string')) throw Error('Movimiento inválido.');
        }
        return data;
    }
    function createStore(storage) {
        function read() {
            const raw = storage.getItem(KEY);
            return raw === null ? defaults() : validate(JSON.parse(raw));
        }
        function save(data) {
            validate(data);
            storage.setItem(KEY, JSON.stringify(data));
        }
        function move(action, items, user) {
            if (!['ingreso', 'retiro'].includes(action) || !items.length) throw Error('Agregá al menos un producto.');
            if (!['nombre', 'apellido', 'dni', 'seccion'].every(k => typeof user[k] === 'string' && user[k].trim())) throw Error('Completá los datos del responsable.');
            const data = read();
            for (const entry of items) {
                const item = clone(entry);
                if (!Number.isSafeInteger(item.cantidad) || item.cantidad <= 0) throw Error('La cantidad debe ser un entero mayor a cero.');
                const existing = data.items.find(x => x.codigo_barras === item.codigo_barras);
                if (action === 'retiro') {
                    if (!existing || existing.cantidad < item.cantidad) throw Error('Stock insuficiente para ' + item.modelo + '.');
                    existing.cantidad -= item.cantidad;
                } else if (existing) {
                    if (['categoria', 'modelo', 'unidad'].some(k => existing[k] !== item[k])) throw Error('El código ya pertenece a otro producto.');
                    existing.cantidad += item.cantidad;
                } else data.items.push(item);
            }
            const index = data.users.findIndex(x => x.dni === user.dni);
            if (index < 0) data.users.push(clone(user)); else data.users[index] = clone(user);
            const op = {id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), date: new Date().toISOString(), action, user: clone(user), items: clone(items)};
            data.operations.unshift(op);
            save(data);
            return op;
        }
        return {read, save, move, restore: data => save(validate(clone(data)))};
    }
    root.DepositoStore = {createStore, validate, defaults};
    if (typeof module !== 'undefined') module.exports = root.DepositoStore;
})(typeof window === 'undefined' ? globalThis : window);
