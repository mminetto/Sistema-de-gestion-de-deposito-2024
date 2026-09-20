from flask import Flask, render_template, request, jsonify
import sqlite3,random,string
import os
from datetime import datetime
#6/8
#9/12
app = Flask(__name__)

# Importar la función para inicializar la base de datos
from database import init_db



# Inicializar la base de datos si no existe
if not os.path.exists('materials.db'):
    
    print("Create DB")
    init_db()

def get_db_connection():
    conn = sqlite3.connect('materials.db', check_same_thread=False)
    conn.execute('PRAGMA journal_mode=WAL')
    return conn

@app.route('/api/get_operations', methods=['GET'])
def get_operations():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = '''
            SELECT p.id, p.fecha_hora, u.nombre || ' ' || u.apellido AS usuario, 
                p.operacion, i.modelo || ' - ' || i.codigo_barras AS item, 
                c.nombre AS categoria, dp.cantidad
            FROM procesos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN detalles_proceso dp ON p.id = dp.proceso_id
            JOIN items i ON dp.item_id = i.id
            JOIN categorias c ON i.category_id = c.id
            ORDER BY p.fecha_hora DESC
        '''

        
        cursor.execute(query)
        operations = cursor.fetchall()
    
        operations_data = []
        for operation in operations:
            operations_data.append({
                'proceso_id': operation[0],
                'fecha_hora': operation[1],
                'usuario': operation[2],
                'operacion': operation[3],
                'items': operation[4],
                'categoria': operation[5]
            })
        
        return jsonify(operations_data)
    
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': str(e)}), 500
    
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        conn.close()


@app.route('/')
def historial():
    return render_template('historial.html', current_page="historial")

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('query', '').lower()
    connection = get_db_connection()
    cursor = connection.cursor()
    
    cursor.execute("""
        SELECT items.codigo_barras, categorias.nombre, items.modelo, categorias.tipo, items.ubicacion, items.cantidad, categorias.unidad, items.estado, categorias.stock_critico
        FROM items
        JOIN categorias ON items.category_id = categorias.id
        WHERE LOWER(categorias.nombre) LIKE ? 
        OR LOWER(items.modelo) LIKE ?""", 
        ('%' + query + '%', '%' + query + '%')
    )
    results = cursor.fetchall()
    connection.close()
    items = [
        {
            'categoria': result[1],
            'modelo': result[2],
            'tipo': result[3],
            'ubicacion': result[4],
            'cantidad': result[5],
            'unidad': result[6],
            'estado': result[7],
            'stock_critico': result[8],
        } for result in results
    ]
    
    return jsonify(items)

@app.route('/api/cantidad_modelo', methods=['GET'])
def cantidad_modelo():
    query = request.args.get('query', '').lower()
    connection = get_db_connection()
    cursor = connection.cursor()
    
    cursor.execute("""
            SELECT SUM(items.cantidad)
            FROM items
            JOIN categorias ON items.category_id = categorias.id
            WHERE LOWER(items.modelo) LIKE ?
            AND categorias.id = items.category_id""", 
        ('%' + query + '%',)
    )   
    results = cursor.fetchall()
    connection.close()
    print(results)  
    return jsonify(results)
@app.route('/api/generate_code', methods=['GET'])
def generate_code():
    conn = sqlite3.connect('materials.db')
    cursor = conn.cursor()
    
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
        cursor.execute("SELECT COUNT(*) FROM items WHERE codigo_barras = ?", (code,))
        if cursor.fetchone()[0] == 0:
            break
            
    conn.close()
    return jsonify({'code': code})



@app.route('/api/confirm_user', methods=['POST'])
def confirm_user():
    data = request.get_json()
    print("Data received:", data)

    if not data or 'user' not in data or 'items' not in data or 'actionType' not in data:
        return jsonify({'error': 'Invalid input data'}), 400

    user = data['user']
    items = data['items']
    action_type = data['actionType']  # 'ingreso' o 'retiro'
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM usuarios WHERE dni = ?", (user['dni'],))
        user_row = cursor.fetchone()

        if user_row:
            user_id = user_row[0]
        else:
            cursor.execute('''
                INSERT INTO usuarios (nombre, apellido, telefono, email, dni, seccion)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user['nombre'], user['apellido'], user['telefono'], user['email'], user['dni'], user['seccion']))
            user_id = cursor.lastrowid

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('''
            INSERT INTO procesos (fecha_hora, usuario_id, operacion)
            VALUES (?, ?, ?)
        ''', (now, user_id, 'Ingreso' if action_type == 'ingreso' else 'Retiro'))
        process_id = cursor.lastrowid
        print("Process ID:", process_id)
        for item in items:
            required_fields = ['codigo_barras', 'categoria', 'modelo', 'tipo', 'ubicacion', 'cantidad', 'unidad', 'estado', 'stock_critico']
            missing_fields = [field for field in required_fields if field not in item]
            
            if missing_fields:
                return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

            codigo_barras = item['codigo_barras']
            categoria = item['categoria']
            modelo = item['modelo']
            tipo = item['tipo']
            ubicacion = item['ubicacion']
            cantidad_str = item['cantidad']
            unidad = item['unidad']
            estado = item['estado']
            stock_critico = item['stock_critico']

            try:
                cantidad = int(cantidad_str)
            except ValueError:
                return jsonify({'error': f'Invalid value for "cantidad": {cantidad_str}'}), 400

            cursor.execute("SELECT id FROM categorias WHERE LOWER(nombre) = ?", (categoria.lower(),))
            category_id_row = cursor.fetchone()
            
            if category_id_row:
                category_id = category_id_row[0]
            else:
                cursor.execute('''
                    INSERT INTO categorias (nombre, tipo, stock_critico, unidad, total)
                    VALUES (?, ?, ?, ?, 0)
                ''', (categoria, tipo, stock_critico, unidad))
                category_id = cursor.lastrowid

            cursor.execute("SELECT id, cantidad FROM items WHERE codigo_barras = ?", (codigo_barras,))
            existing_item = cursor.fetchone()

            if existing_item:
                item_id = existing_item[0]
                existing_quantity = existing_item[1]
                new_quantity = existing_quantity + cantidad if action_type == 'ingreso' else existing_quantity - cantidad
                print(f"New quantity: {new_quantity}")
                cursor.execute('''
                    UPDATE items
                    SET category_id = ?, modelo = ?, ubicacion = ?, cantidad = ?, estado = ?
                    WHERE id = ?
                ''', (category_id, modelo, ubicacion, new_quantity, estado, item_id))
            else:
                if(action_type == 'ingreso'):
                    cursor.execute('''
                        INSERT INTO items (codigo_barras, category_id, modelo, ubicacion, cantidad, estado)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (codigo_barras, category_id, modelo, ubicacion, cantidad, estado))
                    item_id = cursor.lastrowid
                else:
                    cursor.execute('''
                        INSERT INTO items (codigo_barras, category_id, modelo, ubicacion, cantidad, estado)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (codigo_barras, category_id, modelo, ubicacion, -1 * cantidad, estado))
                    item_id = cursor.lastrowid
            cursor.execute('''
                INSERT INTO detalles_proceso (proceso_id, item_id, cantidad)
                VALUES (?, ?, ?)
            ''', (process_id, item_id, cantidad))
        
        # Actualiza el total de la categoría considerando el tipo de acción
        if action_type == 'ingreso':
            cursor.execute('''
                UPDATE categorias
                SET total = (
                    SELECT COALESCE(SUM(cantidad), 0)
                    FROM items
                    WHERE items.category_id = categorias.id
                )
            ''')
        elif action_type == 'retiro':
            cursor.execute('''
                UPDATE categorias
                SET total = (
                    SELECT COALESCE(SUM(cantidad), 0)
                    FROM items
                    WHERE items.category_id = categorias.id
                )
                WHERE id = (SELECT category_id FROM items WHERE id = ?)
            ''', (item_id,))

        conn.commit()
        return jsonify({'success': True}), 200

    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

    finally:
        conn.close()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT nombre, total FROM categorias')
    categories = cursor.fetchall()
    connection.close()
    return jsonify([row[0] for row in categories])

@app.route('/api/models', methods=['GET'])
def get_models():
    category = request.args.get('category', '').lower()
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        SELECT DISTINCT modelo
        FROM items
        JOIN categorias ON items.category_id = categorias.id
        WHERE LOWER(categorias.nombre) = ?
    ''', (category,))
    models = cursor.fetchall()
    connection.close()
    return jsonify([row[0] for row in models])

@app.route('/api/category_quantity', methods=['GET'])
def get_category_quantity():
    category = request.args.get('category', '').lower()
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        SELECT total
        FROM categorias
        WHERE LOWER(nombre) = ?
    ''', (category,))
    total_quantity = cursor.fetchone()
    connection.close()
    return jsonify({'total': total_quantity[0] if total_quantity else 0})


@app.route('/api/types', methods=['GET'])
def get_types():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT DISTINCT valor FROM valores_defecto WHERE apartado="tipo" AND valor IS NOT NULL')
    types = cursor.fetchall()
    connection.close()
    return jsonify([row[0] for row in types])


@app.route('/api/values/<apartado>', methods=['GET', 'POST', 'DELETE', 'PUT'])
def manage_values(apartado):
    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == 'GET':
        cursor.execute('SELECT valor FROM valores_defecto WHERE apartado = ?', (apartado,))
        values = [row[0] for row in cursor.fetchall()]
        connection.close()
        return jsonify(values)

    elif request.method == 'POST':
        value = request.json.get('value')
        if value:
            cursor.execute('INSERT INTO valores_defecto (apartado, valor) VALUES (?, ?)', (apartado, value))
            connection.commit()
            connection.close()
            return jsonify({'message': 'Valor agregado exitosamente'}), 201
        return jsonify({'error': 'No se proporcionó el valor'}), 400

    elif request.method == 'DELETE':
        value = request.json.get('value')
        if value:
            cursor.execute('DELETE FROM valores_defecto WHERE apartado = ? AND valor = ?', (apartado, value))
            connection.commit()
            connection.close()
            return jsonify({'message': 'Valor eliminado exitosamente'}), 200
        return jsonify({'error': 'No se proporcionó el valor'}), 400

    elif request.method == 'PUT':
        old_value = request.json.get('old_value')
        new_value = request.json.get('new_value')
        if old_value and new_value:
            cursor.execute('UPDATE valores_defecto SET valor = ? WHERE apartado = ? AND valor = ?', (new_value, apartado, old_value))
            connection.commit()
            connection.close()
            return jsonify({'message': 'Valor actualizado exitosamente'}), 200
        return jsonify({'error': 'Datos incompletos'}), 400

@app.route('/api/units', methods=['GET'])
def get_units():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT DISTINCT valor FROM valores_defecto WHERE apartado="unidad" AND valor IS NOT NULL')
    units = cursor.fetchall()
    connection.close()
    return jsonify([row[0] for row in units])


@app.route('/api/locations', methods=['GET'])
def get_locations():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT DISTINCT valor FROM valores_defecto WHERE apartado="ubicacion_usuario" AND valor IS NOT NULL')
    locations = cursor.fetchall()
    connection.close()
    return jsonify([row[0] for row in locations])

@app.route('/api/sections', methods=['GET'])
def get_sections():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT DISTINCT valor FROM valores_defecto WHERE apartado="ubicacion" AND valor IS NOT NULL')
    sections = cursor.fetchall()
    print(sections)
    print([row[0] for row in sections])
    connection.close()
    return jsonify([row[0] for row in sections])

@app.route('/api/states', methods=['GET'])
def get_states():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT DISTINCT valor FROM valores_defecto WHERE apartado="estado" AND valor IS NOT NULL')
    states = cursor.fetchall()
    connection.close()
    return jsonify([row[0] for row in states])

@app.route('/api/item_by_barcode', methods=['GET'])
def get_item_by_barcode():
    barcode = request.args.get('barcode', '').strip()
    
    if not barcode:
        return jsonify({'success': False, 'error': 'Barcode is required'}), 400
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Fetch the item detail
        cursor.execute('SELECT * FROM items WHERE codigo_barras = ?', (barcode,))
        item = cursor.fetchone()
        
        if not item:
            return jsonify({'success': False, 'error': 'No item found with the provided barcode'}), 404

        # Fetch the category details
        category_id = item[6]
        cursor.execute('SELECT nombre, tipo, stock_critico, unidad FROM categorias WHERE id = ?', (category_id,))
        category = cursor.fetchone()
        
        if not category:
            return jsonify({'success': False, 'error': 'Category not found for the item'}), 404

        item_data = {
            'codigo_barras': item[1],
            'modelo': item[2],
            'ubicacion': item[3],
            'cantidad': item[4],
            'estado': item[5],
            'categoria': category[0],
            'tipo': category[1],
            'stock_critico': category[2],
            'unidad': category[3]
            
        }

        return jsonify({'success': True, 'item': item_data})

    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        connection.close()



# @app.route('/api/unit_for_category', methods=['GET'])
# def get_unit_for_category():
#     category = request.args.get('category', '')
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     print(category)
#     cursor.execute('''
#         SELECT unidad
#         FROM categorias
#         WHERE categorias.nombre = ?
#         LIMIT 1
#     ''', (category,))
#     unit = cursor.fetchone()
#     print(unit[0])
#     connection.close()
#     return jsonify({'unidad': unit[0] if unit else None})

@app.route('/api/category_details', methods=['GET'])
def get_category_details():
    category = request.args.get('category', '').lower()
    connection = get_db_connection()
    cursor = connection.cursor()
    
    cursor.execute('''
        SELECT tipo, stock_critico, unidad ,total
        FROM categorias
        WHERE LOWER(nombre) = ?
    ''', (category,))
    
    details = cursor.fetchone()
    connection.close()
    
    if details:
        return jsonify({
            'tipo': details[0],
            'stock_critico': details[1],
            'unidad': details[2],
            'total': details[3]
        })
    else:
        return jsonify({
            'tipo': None,
            'stock_critico': None,
            'unidad': None,
            'total': None
        })
        
@app.route('/api/user_search', methods=['GET'])
def user_search():
    query = request.args.get('query', '').lower()
    connection = get_db_connection()
    cursor = connection.cursor()
    
    cursor.execute("""
        SELECT nombre, apellido, telefono, email, dni, seccion
        FROM usuarios
        WHERE LOWER(nombre) LIKE ? 
        OR LOWER(apellido) LIKE ?
        OR dni LIKE ?
    """, 
    ('%' + query + '%', '%' + query + '%', '%' + query + '%')
    )
    results = cursor.fetchall()
    connection.close()
    users = [
        {
            'nombre': result[0],
            'apellido': result[1],
            'telefono': result[2],
            'email': result[3],
            'dni': result[4],
            'seccion': result[5],
        } for result in results
    ]

    return jsonify(users)

@app.route('/busqueda')
def busqueda():
    return render_template('busqueda.html',current_page="busqueda")

@app.route('/analiticas')
def analiticas():
    return render_template('analiticas.html',current_page="analiticas")

@app.route('/configuracion')
def configuracion():
    return render_template('configuracion.html',current_page="configuracion")   


if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=5000, debug=True)
    app.run(port=5000,debug=True)