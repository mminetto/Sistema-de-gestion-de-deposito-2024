import {updateOperations} from './historial.js';
import * as config from './configuracion.js';
$(document).ready(function() {

    //-------------------------------
    // Base.html
    //-------------------------------
    let itemCount = 1;

    function addItemToConfirmedList(item) {
        barcodeInput.removeClass('is-valid');
        let itemHtml = `
            <li class="list-group-item confirmed-item p-1 animate__animated animate__fadeInUp" data-tipo="${item.tipo}" data-ubicacion="${item.ubicacion}" data-estado="${item.estado}" data-stock_critico="${item.stock_critico}" data-unidad="${item.unidad}">
                <div class="card-body">
                    <h7 class="card-title">${item.codigo_barras} <br><strong>${item.cantidad} - ${item.unidad}</strong></h7>
                    <p class="card-text">${item.categoria} - ${item.modelo}</p>
                    <button type="button" class="btn btn-warning btn-sm edit-item" data-item='${JSON.stringify(item)}'>Editar</button>
                    <button type="button" class="btn btn-danger btn-sm delete-item" data-item='${JSON.stringify(item)}'>Eliminar</button>
                </div>
            </li>   
        `;
        $('#confirmed-items-container').append(itemHtml);
    }

    let isValid = true;
    let barcodes = [];
    $('#addItem').on('click', function() {
        isValid = true;
        let modeloInput = $('#modelo');
        let tipoSelect = $('#types');
        let ubicacionInput = $('#locations');
        let cantidadInput = $('#cantidad');
        let unidadSelect = $('#units');
        let estadoSelect = $('#states');
        let stockCriticoInput = $('#stock_critico');
        let barcodeInput = $('#barcode');
        let categoriaInput = $('#categoria');
        
        let item = {
            codigo_barras: barcodeInput.val(),
            categoria: categoriaInput.val(),
            modelo: modeloInput.val(),
            tipo: tipoSelect.val(),
            ubicacion: ubicacionInput.val(),
            cantidad: cantidadInput.val(),
            unidad: unidadSelect.val(),
            estado: estadoSelect.val(),
            stock_critico: stockCriticoInput.val()
        };
    
        // Validar todos los campos
      
        if (!modeloInput.val()) {
            modeloInput.addClass('is-invalid');
            isValid = false;
        } else {
            
            modeloInput.removeClass('is-invalid');
        }
    
        if (!tipoSelect.val()) {
            tipoSelect.addClass('is-invalid');
            isValid = false;
        } else {
            
            tipoSelect.removeClass('is-invalid');
        }
    
        if (!ubicacionInput.val()) {
            ubicacionInput.addClass('is-invalid');
            isValid = false;
        } else {
            
            ubicacionInput.removeClass('is-invalid');
        }
        
        if (!cantidadInput.val() || cantidadInput.val() <= 0) {
            $('#cantidad-error').text('Debe ser mayor 0');
            cantidadInput.addClass('is-invalid');
            isValid = false;
        } else {
            
            cantidadInput.removeClass('is-invalid');
        }

        if(actionType === 'retiro' && cantidadInput.val() > $('#basic-addon2').text()){ 
            $('#cantidad-error').text('Debe ser menor al stock actual');
            cantidadInput.addClass('is-invalid');
            isValid = false;
        }
        else {
            
            cantidadInput.removeClass('is-invalid');
        }
    
        if (!unidadSelect.val()) {
            unidadSelect.addClass('is-invalid');
            isValid = false;
        } else {
            
            unidadSelect.removeClass('is-invalid');
        }
    
        if (!estadoSelect.val()) {
            estadoSelect.addClass('is-invalid');
            isValid = false;
        } else {
            
            estadoSelect.removeClass('is-invalid');
        }
    
        if (!stockCriticoInput.val() || stockCriticoInput.val() < 0) {
            $('#stock_critico-error').text('Debe ser mayor o igual a 0');
            stockCriticoInput.addClass('is-invalid');
            isValid = false;
        } else {
            
            stockCriticoInput.removeClass('is-invalid');
        }
    
      
        handleEvent({ type: 'click' });
        console.log(barcodes)
        console.log(barcodeInput.val())
        // Validar cada campo y mostrar mensajes de error si es necesario
        for (let i = 0; i < barcodes.length; i++) {
            if (barcodes[i] === barcodeInput.val()) {
                $('#barcode-error').text('Ya existe el código de barras');
                barcodeInput.addClass('is-invalid');
                isValid = false;
                break;
            }
            else {
                $('#barcode-error').text('No se encontró el ítem con el código de barras.'); // Limpiar el mensaje de error si el código de barras es diferente
            }
        }
        console.log(isValid)
        // Si todos los campos son válidos, agregar el ítem a la lista
        if (isValid) {
            
            $('#types').prop('disabled', false)
            $('#units').prop('disabled', false);
            addItemToConfirmedList(item);
            $('#ingresoForm').trigger('reset');
            barcodes.push(barcodeInput.val());
            $('#barcode').val('');
        } 
    });
    
    
    //Editar elimina y sobreescribe
    $(document).on('click', '.edit-item', function() {
        let item = $(this).data('item');
        $('#barcode').val(item.codigo_barras);
        $('#categoria').val(item.categoria);
        $('#modelo').val(item.modelo);
        $('#types').val(item.tipo).prop('disabled', true);
        $('#locations').val(item.ubicacion);
        $('#cantidad').val(item.cantidad);
        $('#units').val(item.unidad).prop('disabled', true);
        $('#states').val(item.estado);
        $('#stock_critico').val(item.stock_critico);
        $(this).closest('.confirmed-item').remove()
        $('#userFormDiv').addClass('d-none');
        $('#userFormDiv').addClass('animate__fadeInUp');
        $('#scont').removeClass('d-none');
    });
    $(document).on('click', '.delete-item', function() {
        $(this).closest('.confirmed-item').remove();
    });

    function fetchAndDisplayMaterials(query = '') {
        $.ajax({
            url: '/api/search',
            method: 'GET',  
            data: { query: query },
    
            success: function(data) {
                let resultsContainer = $('#search-results');
                resultsContainer.empty();
                
                if (data.length === 0) {
                    // Mostrar mensaje cuando no hay resultados
                    resultsContainer.append(`
                        <div >
                            <p>No se encontraron resultados</p>
                        </div>
                    `);
                  
                } else {
                    // Si hay resultados, mostrarlos
                    data.forEach(item => {
                        resultsContainer.append(`
                            <div class="search-result-card" data-item='${JSON.stringify(item)}'>
                                <p>${item.categoria} - ${item.modelo}</p>
                            </div>
                        `);
                    });
    
                    // Manejar el click en los resultados
                    $('.search-result-card').on('click', function() {
                        let item = $(this).data('item');
                        
                        $('#categoria').val(item.categoria).prop('disabled', false);
                        $('#modelo').val(item.modelo).prop('disabled', false);
                        $('#types').val(item.tipo).prop('disabled', true);
                        $('#locations').val(item.ubicacion).prop('disabled', false);
                        $('#units').val(item.unidad).prop('disabled', true);
                        $('#states').val(item.estado).prop('disabled', false);
                        $('#stock_critico').val(item.stock_critico).prop('disabled', false);
                        $('#search-results-container').hide();
                        updateStocks();
                        
                    });
                }
            },
            error: function(error) {
                console.error('Error fetching materials:', error);
            }
        });
    }
    
    $('.search-result-card, #barcode').on('click', function() {
        let item = $(this).data('item'); // Asegúrate de que este "item" tiene la categoría y modelo correctos.
        let category = item.categoria;

        $('#categoria').val(category);
        updateModels(category); // Actualiza el datalist de modelos según la categoría autocompletada
    });
  
    $('#modelo').on('input', updateStocks);
    $('#categoria').on('input', updateStocks);
    function updateStocks() {
        let query = $('#modelo').val();
        let category = $('#categoria').val(); // Obtener la categoría actual
        if (query) {
            updateModels(category);
            $.ajax({
                url: '/api/cantidad_modelo',
                method: 'GET',  
                data: { query: query },
        
                success: function(data) {
                    let stock = $('#basic-addon2');
                    console.log(data[0][0])
                    stock.text(data[0][0]);
                },
                error: function(error) {
                    console.error('Error fetching materials:', error);
                }
            });
        }
        else {
            $('#basic-addon2').text("Stock");
        }

        
        updateModels(category);
        // updateUnits(category);
        
            
            if (category) {
                $.ajax({
                    url: '/api/category_details',
                    method: 'GET',
                    data: { category: category },
                    success: function(response) {
                        if (response.tipo) {
                            $('select[name="tipo"]').val(response.tipo).prop('disabled', true);
                        } else {
                            $('select[name="tipo"]').val('').prop('disabled', false);
                        }
                        
                        if (response.stock_critico) {
                            $('input[name="stock_critico"]').val(response.stock_critico);
                        } else {
                            $('input[name="stock_critico"]').val('').prop('disabled', false);
                        }
                            
                        if (response.unidad) {
                            $('select[name="unidad"]').val(response.unidad).prop('disabled', true);
                        } else {
                            $('select[name="unidad"]').val('').prop('disabled', false);
                        }

                        if (response.total) {
                            $('#category-error').text('Total: ' + response.total).addClass('d-block').removeClass('d-none');
                        } else {
                            $('#category-error').text('').removeClass('d-block').addClass('d-none').removeClass('d-block');
                        }
                        },
                    error: function(error) {
                        console.error('Error fetching category details:', error);
                    }
                });
            }
            else{
                $('#category-error').text('').removeClass('d-block').addClass('d-none').removeClass('d-block');
            }
        console.log(category);
    }
    function updateModels(category) {
        $.ajax({
            url: '/api/models',
            method: 'GET',
            data: { category: category },
            success: function(data) {
                let modelsDatalist = $('#models');
                modelsDatalist.empty(); // Limpiar el datalist
                data.forEach(model => {
                    modelsDatalist.append(`<option value="${model}">`);
                });
            },
            error: function(error) {
                console.error('Error fetching models:', error);
            }
        });
    }
    function updateUnits(category) {
        $.ajax({
            url: '/api/unit_for_category',
            method: 'GET',
            data: { category: category },
            success: function(response) {
                let unitInput = $('#units');
                console.log(response);
                if (response.unidad) {

                    unitInput.val(response.unidad).prop('disabled', true);
                } else {
                    unitInput.val('').prop('disabled', false);
                }
            }
        });

    
    }
    function updateDatalists() {
        // Actualiza categorías, tipos, ubicaciones, unidades y estados
 
        $.ajax({
            url: '/api/categories',
            method: 'GET',
            success: function(data) {
                let categoriesDatalist = $('#categories');
                categoriesDatalist.empty();
                data.forEach(category => {
                    categoriesDatalist.append(`<option value="${category}">${category}</option>`);
                });
            }
        })
        $.ajax({
            url: '/api/types',
            method: 'GET',
            success: function(data) {
                let typesDatalist = $('#types');
                data.forEach(type => {
                    typesDatalist.append(`<option value="${type}">${type}</option>`);
                });
                
            }
        });

        // Ubicaciones
        $.ajax({
            url: '/api/locations',
            method: 'GET',
            success: function(data) {
                let locationsDatalist = $('#locations');
                // locationsDatalist.empty();
                data.forEach(location => {
                    locationsDatalist.append(`<option value="${location}">${location}</option>`);
                });
                let ubicacionConfig = $('#ubicacionConfig');
                // locationsDatalist.empty();
                data.forEach(location => {
                    ubicacionConfig.append(`<p>${location}</p>`);
                });
            }       
        });
        $.ajax({
            url: '/api/sections',
            method: 'GET',
            success: function(data) {
                let sectionsDatalist = $('#seccion');
                // locationsDatalist.empty();
                console.log(data);
                data.forEach(section => {
                    sectionsDatalist.append(`<option value="${section}">${section}</option>`);
                });
                let seccionConfig = $('#seccionConfig');
                // locationsDatalist.empty();
              
                data.forEach(section => {
                    seccionConfig.append(`<div class="valor d-flex justify-content mt-2"><p class="text-align-center me-2">${section}</p> <button class="btn btn-danger btn-sm">Eliminar</button></div>`);
                });
            }
        });
        // Unidades
        $.ajax({
            url: '/api/units',
            method: 'GET',
            success: function(data) {
                let unitsDatalist = $('#units');

                data.forEach(unit => {
                    unitsDatalist.append(`<option value="${unit}">${unit}</option>`);
                });
                let unidadesConfig = $('#unidadesConfig');

                data.forEach(unit => {
                    unidadesConfig.append(`<p>${unit}</p>`);
                });
            }
        });
        $.ajax({
            url: '/api/states',
            method: 'GET',
            success: function(data) {
                let statesDatalist = $('#states');

                data.forEach(states => {
                    statesDatalist.append(`<option value="${states}">${states}</option>`);
                });
                let estadoConfig = $('#estadoConfig');

                data.forEach(states => {
                    estadoConfig.append(`<p>${states}</p>`);
                });
            }
        });
        // Hacer lo mismo para tipos, ubicaciones, unidades y estados
    }

    updateDatalists();
    let barcodeInput = $('#barcode');

    let activeInput = null; // Para almacenar el campo de entrada activo
    $('input').on('focus', function() {
        activeInput = $(this);
    });

    $('input').on('blur', function() {
        if (activeInput === $(this)) {
            activeInput = null;
        }
    });

    
    
    
    $('#search').on('input', function() {
        let query = $(this).val();
        console.log(query);
        if (query) {
            $('#search-results-container').show();
            fetchAndDisplayMaterials(query);
        } else {
            $('#search-results-container').hide();
        }
    });
    
    $('#barcode').on('input', handleEvent);
    $('#generate-code').on('click', function() {
        let inputField = $('#barcode');
        
        // Genera el código primero
        $.ajax({
            url: '/api/generate_code',
            method: 'GET',
            success: function(data) {
                inputField.val(data.code); // Actualiza el valor del input con el código generado
                // Después de actualizar el valor, llama a handleEvent para manejar la validación
                handleEvent({ type: 'click' });
            },
            error: function(error) {
                console.error('Error generating code:', error);
            }
        });
    });
    
    function handleEvent(event) {
        let barcode;
        let barcodeError = $('#barcode-error');
        
        // Obtener el valor del input al activar el evento correspondiente
        if (event.type === 'input') {
            barcode = $(this).val().trim();
        } else if (event.type === 'click') {
            barcode = $('#barcode').val().trim();
        }
        
        console.log(barcode);
        console.log(barcode.length);
        
        if (barcode.length === 12) {
            $.ajax({
                url: '/api/item_by_barcode',
                method: 'GET',
                data: { barcode: barcode },
    
                success: function(response) {
                    if (response.success) {
                        let item = response.item;
                        $('#categoria').val(item.categoria).prop('disabled', false);
                        $('#modelo').val(item.modelo).prop('disabled', false);
                        $('#types').val(item.tipo).prop('disabled', true);
                        $('#locations').val(item.ubicacion).prop('disabled', false);
                        $('#units').val(item.unidad).prop('disabled', true);
                        $('#states').val(item.estado).prop('disabled', false);
                        $('#stock_critico').val(item.stock_critico).prop('disabled', false);
                        $('#barcode').removeClass('is-invalid').addClass('is-valid');
                        barcodeError.text('');
                        updateUnits(item.categoria);
                        updateStocks();
                        isValid = true
                        if (activeInput && activeInput.attr('id') !== 'barcode') {
                            activeInput.val('');
                        }
                    }
                },
                error: function(error) {
                    isValid=true
    
                }
            });
        } else {
            $('#barcode').addClass('is-invalid');
            isValid=false
            barcodeError.text('El código de barras debe tener 12 dígitos.');
        }
    }
    
    

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.search-container').length) {
            $('#search-results-container').hide();
        }
    });

    

    
        
  

    let actionType = ' ';
    function setAction(action) {

        if (action === 'ingreso') {
            $('#ModalLabel').empty();
            $('#ModalLabel').append(`<svg class="rotate-svg" height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:#94afb000;" d="M395.47,296.3H116.531c-36.816,0-57.855-42.009-35.803-71.491L225.983,30.621
	c14.993-20.043,45.041-20.043,60.034,0l145.254,194.188C453.325,254.291,432.286,296.3,395.47,296.3z"/>
<path style="fill:#94b09d;" d="M443.755,215.471L298.501,21.284C288.382,7.759,272.893,0,256.001,0s-32.383,7.759-42.5,21.284
	L68.245,215.471c-13.759,18.393-15.916,42.579-5.631,63.119c10.286,20.54,30.946,33.298,53.916,33.298h66.552
	C185.227,422.598,275.94,512,387.153,512c8.608,0,15.589-6.979,15.589-15.589V381.652c0-8.61-6.981-15.589-15.589-15.589
	c-14.01,0-27.556-5.074-38.144-14.29c-6.494-5.651-16.339-4.971-21.993,1.525c-5.653,6.494-4.97,16.34,1.525,21.993
	c12.293,10.699,27.185,17.765,43.025,20.577v84.258c-86.772-7.791-155.289-79.949-157.307-168.237H395.47
	c22.97,0,43.63-12.759,53.917-33.298C459.671,258.052,457.514,233.866,443.755,215.471z M421.509,264.629
	c-5.043,10.069-14.777,16.081-26.04,16.081H116.53c-11.261,0-20.995-6.011-26.038-16.081c-5.043-10.07-4.027-21.466,2.72-30.484
	L238.466,39.957c4.173-5.581,10.565-8.781,17.534-8.781c6.97,0,13.36,3.2,17.534,8.781l145.254,194.188
	C425.534,243.165,426.551,254.56,421.509,264.629z"/>
</svg> Ingresar Item`);
            actionType = 'ingreso';
            $('#content-modal').removeClass('border-retirar').addClass('border-ingresar');
        } else if (action === 'retiro') {
            $('#ModalLabel').empty();
            $('#ModalLabel').append(`<svg height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:#94afb000;" d="M395.47,296.3H116.531c-36.816,0-57.855-42.009-35.803-71.491L225.983,30.621
	c14.993-20.043,45.041-20.043,60.034,0l145.254,194.188C453.325,254.291,432.286,296.3,395.47,296.3z"/>
<path style="fill:#b0949a;" d="M443.755,215.471L298.501,21.284C288.382,7.759,272.893,0,256.001,0s-32.383,7.759-42.5,21.284
	L68.245,215.471c-13.759,18.393-15.916,42.579-5.631,63.119c10.286,20.54,30.946,33.298,53.916,33.298h66.552
	C185.227,422.598,275.94,512,387.153,512c8.608,0,15.589-6.979,15.589-15.589V381.652c0-8.61-6.981-15.589-15.589-15.589
	c-14.01,0-27.556-5.074-38.144-14.29c-6.494-5.651-16.339-4.971-21.993,1.525c-5.653,6.494-4.97,16.34,1.525,21.993
	c12.293,10.699,27.185,17.765,43.025,20.577v84.258c-86.772-7.791-155.289-79.949-157.307-168.237H395.47
	c22.97,0,43.63-12.759,53.917-33.298C459.671,258.052,457.514,233.866,443.755,215.471z M421.509,264.629
	c-5.043,10.069-14.777,16.081-26.04,16.081H116.53c-11.261,0-20.995-6.011-26.038-16.081c-5.043-10.07-4.027-21.466,2.72-30.484
	L238.466,39.957c4.173-5.581,10.565-8.781,17.534-8.781c6.97,0,13.36,3.2,17.534,8.781l145.254,194.188
	C425.534,243.165,426.551,254.56,421.509,264.629z"/>
</svg>  
                            Retirar Item`);
            actionType = 'retiro';
            $('#content-modal').removeClass('border-ingresar').addClass('border-retirar');
        }
    }
    
    $('#ingresobtn').on('click', function() {
        setAction('ingreso');
        
    });
    
    $('#retirarbtn').on('click', function() {
        setAction('retiro');
        
    });

    function alertabs(msg,tipo){
        $('#formalert').text(msg).removeClass('d-none').addClass(tipo,'animate__animated', 'animate__fadeInDown');

        // Ocultar el mensaje después de 3 segundos (3000 ms)
        setTimeout(() => {
            $('#formalert').addClass('d-none').removeClass(tipo);
        }, 3000);
        
    }
    let items = [];
    $('#confirmItems').on('click', function(event) {
        event.preventDefault();
        updateStocks();
        items = []; // Reinicia la variable items
    
        $('#confirmed-items-container .confirmed-item').each(function() {
            let item = {
                codigo_barras: $(this).find('.card-body h7').text().split(' ')[0],
                cantidad: $(this).find('.card-body h7').text().split(' - ')[0].split(' ')[1],
                unidad: $(this).find('.card-body h7').text().split(' - ')[1],
                categoria: $(this).find('.card-text').text().split(' - ')[0],
                modelo: $(this).find('.card-text').text().split(' - ')[1],
                tipo: $(this).data('tipo'),
                ubicacion: $(this).data('ubicacion'),
                estado: $(this).data('estado'),
                stock_critico: $(this).data('stock_critico')
            };
    
            if (!item.tipo || !item.ubicacion || !item.unidad || !item.estado || !item.stock_critico) {
                console.error('Campos faltantes en el ítem:', item);
                return;
            }
    
            items.push(item);
        });
    
        if (items.length === 0) {
            alertabs('No hay items para enviar','alert-warning');
            return;
        }
    
        $('#scont').addClass('d-none');
        $('#userFormDiv').removeClass('d-none');
        $('#userFormDiv').removeClass('animate__fadeInUp');
    });








    function insert(isValid,user){
        if (isValid) {
            $.ajax({
                url: '/api/confirm_user',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ user: user, items: items, actionType: actionType }),
                success: function(response) {
                    alertabs('Items enviados correctamente','alert-success');
                    $('#userFormDiv').trigger('reset').addClass('d-none');
                    $('#scont').removeClass('d-none');
                    $('#userForm').trigger('reset');
                    document.getElementById('search').value = '';
                    $('#confirmed-items-container').empty();
                    updateOperations();
                },
                error: function(xhr) {
                    console.error('Error al confirmar usuario y ítems:', xhr.responseText);
                }
            });
        }
    }
    let confirmTimeout;
    let progressBar = $('#barraprog');
    const progressDuration = 4000; // 6 segundos
    let isCancelled = false;
     // 6 segundos
     function modstyle(isValid, user) {
        let ac = 'default';
        if (actionType === 'ingreso') {
            ac = 'Ingresando';
        }
        else if (actionType === 'retiro') {
            ac = 'Retirando';
        }
        
        $('#confirmed-items-card').addClass('border border-success-subtle border-4');
        $('#content-modal').addClass('border border-success');
        $('#confirmed-items-title').addClass('d-none');
        $('#cancel-container').removeClass('d-none');
        $('#cancel-container').append(`<div class="row d-flex justify-content-center align-items-center">
                                            <p class="fs-8 col-6">${user.nombre} ${user.apellido} <strong>${ac}</strong></p>
                                            <button type="button" class="btn btn-secondary col-5" id="cancelConfirm">Cancelar</button>
                                            </div>`);
                                        
        progressBar.removeClass('d-none');
        startProgressBar(isValid, user);
    }
    function stopProgressBar() {
        $('#confirmed-items-card').removeClass('border border-success-subtle border-4');
        $('#confirmed-items-title').removeClass('d-none');
        $('#cancel-container').addClass('d-none').empty();
        $('#content-modal').removeClass('border border-success');
        progressBar.addClass('d-none'); // Oculta la barra de progreso
        clearInterval(confirmTimeout);  // Detiene el temporizador
        isCancelled = true;  // Marca la acción como cancelada
    }
    
    function startProgressBar(isValid, user) {
        let width = 100;
        isCancelled = false;  // Resetea el estado de cancelación
        progressBar.css('width', `${width}%`);
    
        confirmTimeout = setInterval(() => {
            width -= 100 / (progressDuration / 10); // Reduce la barra en función del tiempo
            progressBar.css('width', `${width}%`);
            if (width <= 0) {
                clearInterval(confirmTimeout);
                if (!isCancelled) { // Solo inserta si no fue cancelado
                    insert(isValid, user);
                    stopProgressBar();
                }
            }
        }, 10);
    }
    $(document).on('click', '#cancelConfirm', function() {

        stopProgressBar();
    });
    
    $('#submitUserForm').on('click', function() {
        let user = {
            nombre: $('#nombre').val(),
            apellido: $('#apellido').val(),
            telefono: $('#telefono').val(),
            email: $('#email').val(),
            dni: $('#dni').val(),
            seccion: $('#seccion').val()
        };
    
        let isValid = true;
        $('#userForm .form-control').each(function() {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
                isValid = false;
            } else {
                $(this).removeClass('is-invalid');
            }
        });
    
        if (!$('#seccion').val()) {
            $('#seccion').addClass('is-invalid');
            isValid = false;
        } else {
            $('#seccion').removeClass('is-invalid');
        }
        
        if(isValid){
            modstyle(isValid, user);
        }
    });

    $('#backToItemsForm').on('click', function() {
        $('#userFormDiv').addClass('d-none');
        $('#userFormDiv').addClass('animate__fadeInUp');
        $('#scont').removeClass('d-none');
    });
    $('#backToItemsForm').on('click', function() {
        $('#userFormDiv').addClass('d-none');
        $('#userFormDiv').addClass('animate__fadeInUp');
        $('#scont').removeClass('d-none');
    });
    let userSearchInput = $('#user-search');
    let userSearchResultsContainer = $('#user-search-results-container');
    let userSearchResults = $('#user-search-results');
    userSearchInput.on('input', function() {
        let query = $(this).val();
        if (query) {
            userSearchResultsContainer.show();
            fetchAndDisplayUsers(query);
        } else {
            userSearchResultsContainer.hide();
        }
    });

    // Función para obtener y mostrar usuarios
    function fetchAndDisplayUsers(query = '') {
        $.ajax({
            url: '/api/user_search',
            method: 'GET',
            data: { query: query },
            success: function(data) {
                userSearchResults.empty();
                data.forEach(user => {
                    userSearchResults.append(`
                        <div class="search-result-card" data-user='${JSON.stringify(user)}'>
                            <p>${user.nombre} ${user.apellido} - DNI: ${user.dni}</p>
                        </div>
                    `);
                });
                $('.search-result-card').on('click', function() {
                    let user = $(this).data('user');
                    $('#nombre').val(user.nombre).prop('disabled', false);
                    $('#apellido').val(user.apellido).prop('disabled', false);
                    $('#telefono').val(user.telefono).prop('disabled', false);
                    $('#email').val(user.email).prop('disabled', false);
                    $('#dni').val(user.dni).prop('disabled', false);
                    $('#seccion').val(user.seccion).prop('disabled', false);
                    userSearchResultsContainer.hide();
                });
            },
            error: function(error) {
                console.error('Error fetching users:', error);
            }
        });
    }

    // Cierra el contenedor de resultados si se hace clic fuera de él
    $(document).on('click', function(event) {
        if (!$(event.target).closest('#user-search-container').length) {
            userSearchResultsContainer.hide();
        }
    });
    ['tipo'].forEach(config.loadValues);
    updateOperations();
    console.log(currentPage)
    $(".single").each(function() {

        if ($(this).data("page") === currentPage) {
            
            $(this).children().first().addClass("active-btn"); // Agrega la clase para cambiar el color
        }
    });
});

 // Flask pasa el nombre de la página actual
            

    //----------------------
    // Historial
    //----------------------
    updateOperations();
  




   //----------------------
   // Configuracion
   //----------------------


   
$('.add-button').on('click',config.newElement);
