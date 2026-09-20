import sqlite3

DATABASE = 'materials.db'

 
categories_data = [
      ('Martillo', 'Herramienta', 50, 'Unidades'),
     ('Papel', 'Insumo', 100, 'Metro cuadrado'),
     ('Destornillador', 'Herramienta', 30, 'Unidades'),
     ('Clavo', 'Herramienta', 200, 'Unidades'),
     ('Cinta métrica', 'Herramienta', 25, 'Unidades'),
     ('Lija', 'Herramienta', 150, 'Unidades'),
     ('Tornillo', 'Herramienta', 500, 'Unidades'),
     ('Pegamento', 'Insumo', 80, 'Botellas'),
     ('Pincel', 'Insumo', 60, 'Unidades'),
     ('Tinta', 'Insumo', 70, 'Litros'),
     ('Goma', 'Insumo', 90, 'Unidades'),
     ('Cuaderno', 'Insumo', 120, 'Unidades'),
     ('Regla', 'Herramienta', 40, 'Unidades'),
     ('Alicate', 'Herramienta', 25, 'Unidades'),
     ('Sierra', 'Herramienta', 15, 'Unidades'),
     ('Cúter', 'Herramienta', 45, 'Unidades'),
     ('Tijeras', 'Herramienta', 55, 'Unidades'),
     ('Manguera', 'Insumo', 10, 'Metros'),
     ('Papel carbón', 'Insumo', 100, 'Hojas'),
     ('Calculadora', 'Insumo', 35, 'Unidades'),
     ('Cinta aislante', 'Herramienta', 40, 'Rollos'),
     ('Brocha', 'Herramienta', 30, 'Unidades'),
     ('Pasta', 'Insumo', 75, 'Tubos'),
     ('Pinceles', 'Insumo', 65, 'Unidades'),
     ('Esmalte', 'Insumo', 50, 'Litros'),
     ('Papel aluminio', 'Insumo', 20, 'Metros'),
     ('Nivel', 'Herramienta', 15, 'Unidades'),
     ('Juego de llaves', 'Herramienta', 20, 'Conjuntos'),
     ('Baterías', 'Insumo', 100, 'Unidades'),
     ('Interruptores', 'Insumo', 80, 'Unidades'),
     ('Cables', 'Insumo', 150, 'Metros'),
     ('Clips', 'Insumo', 200, 'Paquetes'),
     ('Grapas', 'Insumo', 120, 'Paquetes'),
     ('Escuadra', 'Herramienta', 25, 'Unidades'),
     ('Masa para modelar', 'Insumo', 40, 'Kilos'),
     ('Agujas', 'Insumo', 75, 'Paquetes'),
     ('Papel fotográfico', 'Insumo', 60, 'Hojas'),
     ('Reloj', 'Insumo', 25, 'Unidades'),
     ('Compás', 'Herramienta', 30, 'Unidades'),
     ('Rotuladores', 'Insumo', 90, 'Unidades'),
     ('Marcadores', 'Insumo', 55, 'Unidades'),
     ('Herramienta de precisión', 'Herramienta', 20, 'Unidades'),
     ('Pinzas', 'Herramienta', 25, 'Unidades'),
     ('Lámpara', 'Insumo', 30, 'Unidades')
  ]

items_data = [
      ('000000000001', 'Philips', 'Sector A', 50, 'Nuevo', 'Martillo'),
     ('000000000002', 'Plano', 'Sector B', 75, 'En uso', 'Martillo'),
     ('000000000003', 'Estándar', 'Sector C', 30, 'En reparación', 'Martillo'),
     ('000000000004', 'Ajustable', 'Sector A', 20, 'Nuevo', 'Papel'),
     ('000000000005', 'Manual', 'Sector B', 40, 'En uso', 'Papel'),
     ('000000000006', 'Cruceta', 'Sector C', 60, 'Nuevo', 'Destornillador'),
     ('000000000007', 'Plano', 'Sector A', 15, 'En uso', 'Destornillador'),
     ('000000000008', 'Estándar', 'Sector B', 25, 'En reparación', 'Destornillador'),
     ('000000000009', 'Clavo de 5cm', 'Sector A', 200, 'Nuevo', 'Clavo'),
     ('000000000010', 'Clavo de 3cm', 'Sector B', 100, 'En uso', 'Clavo'),
     ('000000000011', 'Clavo de 2cm', 'Sector C', 50, 'En reparación', 'Clavo'),
     ('000000000012', 'Cinta métrica 2m', 'Sector A', 25, 'Nuevo', 'Cinta métrica'),
     ('000000000013', 'Cinta métrica 5m', 'Sector B', 10, 'En uso', 'Cinta métrica'),
     ('000000000014', 'Cinta métrica 10m', 'Sector C', 5, 'En reparación', 'Cinta métrica'),
     ('000000000015', 'Lija fina', 'Sector A', 80, 'Nuevo', 'Lija'),
     ('000000000016', 'Lija gruesa', 'Sector B', 70, 'En uso', 'Lija'),
     ('000000000017', 'Lija media', 'Sector C', 100, 'En reparación', 'Lija'),
     ('000000000018', 'Tornillo M4', 'Sector A', 200, 'Nuevo', 'Tornillo'),
     ('000000000019', 'Tornillo M5', 'Sector B', 150, 'En uso', 'Tornillo'),
     ('000000000020', 'Tornillo M6', 'Sector C', 100, 'En reparación', 'Tornillo'),
     ('000000000021', 'Pegamento blanco', 'Sector A', 40, 'Nuevo', 'Pegamento'),
     ('000000000022', 'Pegamento rápido', 'Sector B', 30, 'En uso', 'Pegamento'),
     ('000000000023', 'Pegamento en barra', 'Sector C', 10, 'En reparación', 'Pegamento'),
     ('000000000024', 'Pincel de 1cm', 'Sector A', 20, 'Nuevo', 'Pincel'),
     ('000000000025', 'Pincel de 2cm', 'Sector B', 25, 'En uso', 'Pincel'),
     ('000000000026', 'Pincel de 5cm', 'Sector C', 15, 'En reparación', 'Pincel'),
     ('000000000027', 'Tinta negra', 'Sector A', 10, 'Nuevo', 'Tinta'),
     ('000000000028', 'Tinta azul', 'Sector B', 20, 'En uso', 'Tinta'),
     ('000000000029', 'Tinta roja', 'Sector C', 15, 'En reparación', 'Tinta'),
     ('000000000030', 'Goma blanca', 'Sector A', 50, 'Nuevo', 'Goma'),
     ('000000000031', 'Goma de borrar', 'Sector B', 20, 'En uso', 'Goma'),
     ('000000000032', 'Goma para lápiz', 'Sector C', 20, 'En reparación', 'Goma'),
     ('000000000033', 'Cuaderno A4', 'Sector A', 30, 'Nuevo', 'Cuaderno'),
     ('000000000034', 'Cuaderno A5', 'Sector B', 50, 'En uso', 'Cuaderno'),
     ('000000000035', 'Cuaderno A3', 'Sector C', 40, 'En reparación', 'Cuaderno'),
     ('000000000036', 'Regla de 30cm', 'Sector A', 25, 'Nuevo', 'Regla'),
     ('000000000037', 'Regla de 50cm', 'Sector B', 15, 'En uso', 'Regla'),
     ('000000000038', 'Regla de 100cm', 'Sector C', 10, 'En reparación', 'Regla'),
     ('000000000039', 'Alicate de corte', 'Sector A', 20, 'Nuevo', 'Alicate'),
     ('000000000040', 'Alicate de presión', 'Sector B', 10, 'En uso', 'Alicate'),
     ('000000000041', 'Alicate de punta', 'Sector C', 15, 'En reparación', 'Alicate'),
     ('000000000042', 'Sierra manual', 'Sector A', 10, 'Nuevo', 'Sierra'),
     ('000000000043', 'Sierra de calar', 'Sector B', 5, 'En uso', 'Sierra'),
     ('000000000044', 'Sierra circular', 'Sector C', 5, 'En reparación', 'Sierra'),
     ('000000000045', 'Cúter de precisión', 'Sector A', 25, 'Nuevo', 'Cúter'),
     ('000000000046', 'Cúter estándar', 'Sector B', 15, 'En uso', 'Cúter'),
     ('000000000047', 'Cúter para carton', 'Sector C', 10, 'En reparación', 'Cúter'),
     ('000000000048', 'Tijeras pequeñas', 'Sector A', 30, 'Nuevo', 'Tijeras'),
     ('000000000049', 'Tijeras grandes', 'Sector B', 25, 'En uso', 'Tijeras'),
     ('000000000050', 'Tijeras industriales', 'Sector C', 10, 'En reparación', 'Tijeras'),
     ('000000000051', 'Manguera de agua', 'Sector A', 50, 'Nuevo', 'Manguera'),
     ('000000000052', 'Manguera de aire', 'Sector B', 30, 'En uso', 'Manguera'),
     ('000000000053', 'Manguera de gasolina', 'Sector C', 10, 'En reparación', 'Manguera'),
     ('000000000054', 'Papel carbón', 'Sector A', 100, 'Nuevo', 'Papel carbón'),
     ('000000000055', 'Papel fotográfico', 'Sector B', 50, 'En uso', 'Papel fotográfico'),
     ('000000000056', 'Papel para impresora', 'Sector C', 75, 'En reparación', 'Papel fotográfico'),
     ('000000000057', 'Calculadora científica', 'Sector A', 20, 'Nuevo', 'Calculadora'),
     ('000000000058', 'Calculadora básica', 'Sector B', 10, 'En uso', 'Calculadora'),
     ('000000000059', 'Calculadora gráfica', 'Sector C', 5, 'En reparación', 'Calculadora'),
     ('000000000060', 'Cinta aislante negra', 'Sector A', 20, 'Nuevo', 'Cinta aislante'),
     ('000000000061', 'Cinta aislante roja', 'Sector B', 15, 'En uso', 'Cinta aislante'),
     ('000000000062', 'Cinta aislante amarilla', 'Sector C', 10, 'En reparación', 'Cinta aislante'),
     ('000000000063', 'Brocha para pintura', 'Sector A', 30, 'Nuevo', 'Brocha'),
     ('000000000064', 'Brocha para barniz', 'Sector B', 20, 'En uso', 'Brocha'),
     ('000000000065', 'Brocha para esmalte', 'Sector C', 10, 'En reparación', 'Brocha'),
     ('000000000066', 'Pasta adhesiva', 'Sector A', 40, 'Nuevo', 'Pasta'),
     ('000000000067', 'Pasta modeladora', 'Sector B', 25, 'En uso', 'Pasta'),
     ('000000000068', 'Pasta para manualidades', 'Sector C', 15, 'En reparación', 'Pasta'),
     ('000000000069', 'Pinceles de acuarela', 'Sector A', 30, 'Nuevo', 'Pinceles'),
     ('000000000070', 'Pinceles de óleo', 'Sector B', 20, 'En uso', 'Pinceles'),
     ('000000000071', 'Pinceles de tinta', 'Sector C', 10, 'En reparación', 'Pinceles'),
     ('000000000072', 'Esmalte acrílico', 'Sector A', 20, 'Nuevo', 'Esmalte'),
     ('000000000073', 'Esmalte para madera', 'Sector B', 10, 'En uso', 'Esmalte'),
     ('000000000074', 'Esmalte para metal', 'Sector C', 5, 'En reparación', 'Esmalte'),
     ('000000000075', 'Papel aluminio', 'Sector A', 10, 'Nuevo', 'Papel aluminio'),
     ('000000000076', 'Papel kraft', 'Sector B', 20, 'En uso', 'Papel aluminio'),
     ('000000000077', 'Papel reciclado', 'Sector C', 15, 'En reparación', 'Papel aluminio'),
     ('000000000078', 'Nivel de burbuja', 'Sector A', 10, 'Nuevo', 'Nivel'),
     ('000000000079', 'Nivel láser', 'Sector B', 5, 'En uso', 'Nivel'),
     ('000000000080', 'Nivel de agua', 'Sector C', 5, 'En reparación', 'Nivel'),
     ('000000000081', 'Juego de llaves inglesas', 'Sector A', 15, 'Nuevo', 'Juego de llaves'),
     ('000000000082', 'Juego de llaves hexagonales', 'Sector B', 10, 'En uso', 'Juego de llaves'),
     ('000000000083', 'Juego de llaves de vaso', 'Sector C', 5, 'En reparación', 'Juego de llaves'),
     ('000000000084', 'Baterías AA', 'Sector A', 200, 'Nuevo', 'Baterías'),
     ('000000000085', 'Baterías AAA', 'Sector B', 150, 'En uso', 'Baterías'),
     ('000000000086', 'Baterías 9V', 'Sector C', 100, 'En reparación', 'Baterías'),
     ('000000000087', 'Interruptores simples', 'Sector A', 30, 'Nuevo', 'Interruptores'),
     ('000000000088', 'Interruptores dobles', 'Sector B', 20, 'En uso', 'Interruptores'),
     ('000000000089', 'Interruptores triple', 'Sector C', 10, 'En reparación', 'Interruptores'),
     ('000000000090', 'Cables de conexión', 'Sector A', 100, 'Nuevo', 'Cables'),
     ('000000000091', 'Cables de corriente', 'Sector B', 75, 'En uso', 'Cables'),
     ('000000000092', 'Cables de datos', 'Sector C', 50, 'En reparación', 'Cables'),
     ('000000000093', 'Clips grandes', 'Sector A', 150, 'Nuevo', 'Clips'),
     ('000000000094', 'Clips pequeños', 'Sector B', 100, 'En uso', 'Clips'),
     ('000000000095', 'Clips metálicos', 'Sector C', 50, 'En reparación', 'Clips'),
     ('000000000096', 'Grapas normales', 'Sector A', 100, 'Nuevo', 'Grapas'),
     ('000000000097', 'Grapas grandes', 'Sector B', 75, 'En uso', 'Grapas'),
     ('000000000098', 'Grapas pequeñas', 'Sector C', 50, 'En reparación', 'Grapas'),
     ('000000000099', 'Escuadra de metal', 'Sector A', 10, 'Nuevo', 'Escuadra'),
     ('000000000100', 'Escuadra de plástico', 'Sector B', 15, 'En uso', 'Escuadra'),
     ('000000000101', 'Escuadra de madera', 'Sector C', 5, 'En reparación', 'Escuadra'),
     ('000000000102', 'Masa para modelar blanca', 'Sector A', 25, 'Nuevo', 'Masa para modelar'),
     ('000000000103', 'Masa para modelar negra', 'Sector B', 15, 'En uso', 'Masa para modelar'),
     ('000000000104', 'Masa para modelar roja', 'Sector C', 10, 'En reparación', 'Masa para modelar'),
     ('000000000105', 'Agujas de coser', 'Sector A', 50, 'Nuevo', 'Agujas'),
     ('000000000106', 'Agujas de bordar', 'Sector B', 25, 'En uso', 'Agujas'),
     ('000000000107', 'Agujas de tejer', 'Sector C', 15, 'En reparación', 'Agujas'),
     ('000000000108', 'Papel fotográfico glossy', 'Sector A', 30, 'Nuevo', 'Papel fotográfico'),
     ('000000000109', 'Papel fotográfico mate', 'Sector B', 20, 'En uso', 'Papel fotográfico'),
     ('000000000110', 'Papel fotográfico brillante', 'Sector C', 10, 'En reparación', 'Papel fotográfico'),
     ('000000000111', 'Reloj digital', 'Sector A', 15, 'Nuevo', 'Reloj'),
     ('000000000112', 'Reloj analógico', 'Sector B', 10, 'En uso', 'Reloj'),
     ('000000000113', 'Reloj de pared', 'Sector C', 5, 'En reparación', 'Reloj'),
     ('000000000114', 'Compás de precisión', 'Sector A', 25, 'Nuevo', 'Compás'),
     ('000000000115', 'Compás para dibujo', 'Sector B', 15, 'En uso', 'Compás'),
     ('000000000116', 'Compás de ingeniero', 'Sector C', 10, 'En reparación', 'Compás'),
     ('000000000117', 'Rotuladores permanentes', 'Sector A', 50, 'Nuevo', 'Rotuladores'),
     ('000000000118', 'Rotuladores para pizarra', 'Sector B', 20, 'En uso', 'Rotuladores'),
     ('000000000119', 'Rotuladores de colores', 'Sector C', 30, 'En reparación', 'Rotuladores'),
     ('000000000120', 'Marcadores de texto', 'Sector A', 40, 'Nuevo', 'Marcadores'),
     ('000000000121', 'Marcadores permanentes', 'Sector B', 25, 'En uso', 'Marcadores'),
     ('000000000122', 'Marcadores de pizarra', 'Sector C', 15, 'En reparación', 'Marcadores'),
     ('000000000123', 'Herramienta de precisión para electrónica', 'Sector A', 20, 'Nuevo', 'Herramienta de precisión'),
     ('000000000124', 'Pinzas de precisión', 'Sector B', 30, 'En uso', 'Pinzas'),
     ('000000000125', 'Pinzas de laboratorio', 'Sector C', 15, 'En reparación', 'Pinzas'),
     ('000000000126', 'Lámpara de escritorio', 'Sector A', 30, 'Nuevo', 'Lámpara'),
     ('000000000127', 'Lámpara de trabajo', 'Sector B', 15, 'En uso', 'Lámpara'),
     ('000000000128', 'Lámpara portátil', 'Sector C', 10, 'En reparación', 'Lámpara')
]

users_data = [
     ('Juan', 'Pérez', '123456789', 'juan.perez@example.com', 12345678, 'Sección A'),
     ('María', 'Gómez', '234567890', 'maria.gomez@example.com', 23456789, 'Sección B'),
     ('Carlos', 'Rodríguez', '345678901', 'carlos.rodriguez@example.com', 34567890, 'Sección C'),
     ('Ana', 'López', '456789012', 'ana.lopez@example.com', 45678901, 'Sección D'),
     ('Pedro', 'Martínez', '567890123', 'pedro.martinez@example.com', 56789012, 'Sección A'),
     ('Laura', 'Hernández', '678901234', 'laura.hernandez@example.com', 67890123, 'Sección B'),
     ('Jorge', 'García', '789012345', 'jorge.garcia@example.com', 78901234, 'Sección C'),
     ('Sofía', 'Ramírez', '890123456', 'sofia.ramirez@example.com', 89012345, 'Sección D'),
     ('Miguel', 'Torres', '901234567', 'miguel.torres@example.com', 90123456, 'Sección A'),
     ('Lucía', 'Vargas', '012345678', 'lucia.vargas@example.com', 11234567, 'Sección B'),
     ('Martín', 'Sánchez', '123456789', 'martin.sanchez@example.com', 22345678, 'Sección C'),
     ('Valeria', 'Castro', '234567890', 'valeria.castro@example.com', 33456789, 'Sección D'),
     ('Tomás', 'Ruiz', '345678901', 'tomas.ruiz@example.com', 44567890, 'Sección A'),
     ('Paula', 'Mendoza', '456789012', 'paula.mendoza@example.com', 55678901, 'Sección B'),
     ('Diego', 'Ortega', '567890123', 'diego.ortega@example.com', 66789012, 'Sección C'),
     ('Camila', 'Jiménez', '678901234', 'camila.jimenez@example.com', 77890123, 'Sección D'),
     ('Andrés', 'Ibarra', '789012345', 'andres.ibarra@example.com', 88901234, 'Sección A'),
     ('Isabel', 'Morales', '890123456', 'isabel.morales@example.com', 99012345, 'Sección B'),
     ('Felipe', 'Ramos', '901234567', 'felipe.ramos@example.com', 10123456, 'Sección C'),
     ('Alejandra', 'Rojas', '012345678', 'alejandra.rojas@example.com', 21123456, 'Sección D'),
     ('Gabriel', 'Salas', '123456789', 'gabriel.salas@example.com', 31234567, 'Sección A'),
     ('Natalia', 'Romero', '234567890', 'natalia.romero@example.com', 42345678, 'Sección B'),
     ('Enrique', 'Acosta', '345678901', 'enrique.acosta@example.com', 53456789, 'Sección C'),
     ('Florencia', 'Cruz', '456789012', 'florencia.cruz@example.com', 64567890, 'Sección D'),
     ('Pablo', 'Díaz', '567890123', 'pablo.diaz@example.com', 75678901, 'Sección A'),
     ('Verónica', 'Luna', '678901234', 'veronica.luna@example.com', 86789012, 'Sección B'),
     ('Esteban', 'Peña', '789012345', 'esteban.pena@example.com', 97890123, 'Sección C'),
     ('Carolina', 'Blanco', '890123456', 'carolina.blanco@example.com', 10901234, 'Sección D'),
     ('Ricardo', 'Alonso', '901234567', 'ricardo.alonso@example.com', 11012345, 'Sección A'),
     ('Elena', 'Silva', '012345678', 'elena.silva@example.com', 12123456, 'Sección B')
]

unidades_data = [
    ('Kg',),
    ('Litros',),
    ('Unidades',),
    ('Metros',),
    ('Piezas',),
    ('Mililitros',),
    ('Tubos',),
]

tipos_data = [
    ('Herramienta',),
    ('Insumo',)
]

estados_data = [
    ('Nuevo',),
    ('Usado',),
    ('Reparación',),
    ('Disponible',),
    ('Obsoleto',)
]

ubicaciones_data = [
    ('Sector A',),
    ('Sector B',),
    ('Sector C',),
    ('Sector D',),
    ('Sector E',),
    ('Sector F',)
]

ubicaciones_usuarios_data = [
    ('Sector 1',),
    ('Sector 2',),
    ('Sector 3',),
    ('Sector 4',),
    ('Sector 5',),
    ('Sector 6',)
]
def init_db():
    try:
        connection = sqlite3.connect(DATABASE)
        cursor = connection.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE,
                tipo TEXT,
                stock_critico INTEGER,
                unidad TEXT,
                total INTEGER
            )
        ''')

        # Crear la tabla de ítems
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_barras TEXT,
                modelo TEXT,
                ubicacion TEXT,
                cantidad INTEGER,
                estado TEXT,
                category_id INTEGER,
                FOREIGN KEY (category_id) REFERENCES categorias(id)
            )
        ''')

        # Crear la tabla de usuarios
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT,
                apellido TEXT,
                telefono TEXT,
                email TEXT,
                dni INTEGER,
                seccion TEXT
            )
        ''')

        # Crear la tabla de procesos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS procesos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha_hora TEXT,
                usuario_id INTEGER,
                operacion TEXT,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        ''')

        # Crear la tabla de detalles_proceso
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detalles_proceso (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                proceso_id INTEGER,
                item_id INTEGER,
                cantidad INTEGER,
                FOREIGN KEY (proceso_id) REFERENCES procesos(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            )
        ''')


        cursor.execute('''
        CREATE TABLE IF NOT EXISTS valores_defecto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        apartado TEXT,
        valor TEXT
            )
        ''')

        # Insertar ubicaciones de usuario
        
        for ubicacion_usuario in ubicaciones_usuarios_data:
            cursor.execute('''
                INSERT OR IGNORE INTO valores_defecto (apartado, valor) 
                VALUES (?, ?)
            ''', ('ubicacion_usuario', ubicacion_usuario[0]))

        # Insertar unidades
        for unidad in unidades_data:
            cursor.execute('''
                INSERT OR IGNORE INTO valores_defecto (apartado, valor) 
                VALUES (?, ?)
            ''', ('unidad', unidad[0]))

        # Insertar tipos
        for tipo in tipos_data:
            cursor.execute('''
                INSERT OR IGNORE INTO valores_defecto (apartado, valor) 
                VALUES (?, ?)
            ''', ('tipo', tipo[0]))

        # Insertar estados
        for estado in estados_data:
            cursor.execute('''
                INSERT OR IGNORE INTO valores_defecto (apartado, valor) 
                VALUES (?, ?)
            ''', ('estado', estado[0]))

        # Insertar ubicaciones
        for ubicacion in ubicaciones_data:
            cursor.execute('''
                INSERT OR IGNORE INTO valores_defecto (apartado, valor) 
                VALUES (?, ?)
            ''', ('ubicacion', ubicacion[0]))
        # Insertar categorías


        for category in categories_data:
             cursor.execute('''
                 INSERT OR IGNORE INTO categorias (nombre, tipo, stock_critico, unidad)
                 VALUES (?, ?, ?, ?)
             ''', category)
        for user in users_data:
             cursor.execute('''
                 INSERT INTO usuarios (nombre, apellido, telefono, email, dni, seccion)
                 VALUES (?, ?, ?, ?, ?, ?)
             ''', user) 

         

        seen_barcodes = set()
        for item in items_data:
            if item[0] in seen_barcodes:
                 print(f"Error: Código de barras duplicado encontrado en los datos de prueba: {item[0]}")
                 continue
            seen_barcodes.add(item[0])

            cursor.execute('''
                 INSERT INTO items (codigo_barras, modelo, ubicacion, cantidad, estado, category_id)
                 SELECT ?, ?, ?, ?, ?, id
                 FROM categorias
                 WHERE nombre = ?
             ''', (item[0], item[1], item[2], item[3], item[4], item[5]))

 
        cursor.execute('''
             UPDATE categorias
             SET total = (
                 SELECT COALESCE(SUM(cantidad), 0)
                 FROM items
                 WHERE items.category_id = categorias.id
             )
         ''')

        connection.commit()

    except sqlite3.Error as e:
        print(f"Error al inicializar la base de datos: {e}")
    finally:
        if connection:
            connection.close()


init_db()
