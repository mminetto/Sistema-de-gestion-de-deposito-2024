const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createStore} = require('../static/store.js');
function fixture() {
    const data = new Map();
    const storage = {getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v)};
    return {storage, store: createStore(storage)};
}
const user = {nombre: 'Ana', apellido: 'Pérez', dni: '12345678', seccion: 'Sector 1'};
const item = {codigo_barras: '000000000001', categoria: 'Herramientas', modelo: 'Martillo', tipo: 'Herramienta', estado: 'Nuevo', ubicacion: 'Sector A', cantidad: 10, unidad: 'Unidades', stock_critico: 0};
test('ingreso, retiro completo, historial y persistencia', () => {
    const {store, storage} = fixture();
    store.move('ingreso', [item], user); store.move('retiro', [{...item, cantidad: 10}], user);
    const loaded = createStore(storage).read();
    assert.equal(loaded.items[0].cantidad, 0); assert.equal(loaded.operations.length, 2);
    assert.equal(loaded.users.length, 1); assert.equal(loaded.operations[1].items[0].cantidad, 10);
});
test('retiro inválido revierte todo, incluso códigos repetidos', () => {
    const {store} = fixture(); store.move('ingreso', [item], user); const before = store.read();
    assert.throws(() => store.move('retiro', [{...item, cantidad: 6}, {...item, cantidad: 6}], user), /Stock insuficiente/);
    assert.deepEqual(store.read(), before);
    assert.throws(() => store.move('retiro', [{...item, codigo_barras: 'inexistente'}], user));
    assert.deepEqual(store.read(), before);
});
test('rechaza cantidades inválidas y reutilización de códigos', () => {
    const {store} = fixture(); store.move('ingreso', [item], user);
    for (const cantidad of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => store.move('ingreso', [{...item, cantidad}], user));
    assert.throws(() => store.move('ingreso', [{...item, modelo: 'Otro'}], user));
    assert.equal(store.read().items[0].cantidad, 10);
});
test('respaldo restaura datos; archivos inválidos no sobrescriben', () => {
    const {store} = fixture(); store.move('ingreso', [item], user); const other = fixture().store;
    other.restore(JSON.parse(JSON.stringify(store.read()))); assert.deepEqual(other.read(), store.read());
    assert.throws(() => other.restore({version: 1})); assert.deepEqual(other.read(), store.read());
});
test('fallo de almacenamiento no confirma movimientos', () => {
    const {store, storage} = fixture(); store.move('ingreso', [item], user);
    storage.setItem = () => { throw Error('Sin espacio'); };
    assert.throws(() => store.move('retiro', [{...item, cantidad: 1}], user), /Sin espacio/);
    assert.equal(store.read().items[0].cantidad, 10);
});
