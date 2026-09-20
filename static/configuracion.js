export function loadValues(apartado) {
    $.ajax({
        url: `/api/values/${apartado}`,
        method: 'GET',
        success: function(data) {
            let container = $(`[data-apartado="${apartado}"] .valores-container`);
            container.empty();
            data.forEach(value => {
                addEditableElement(container, value, apartado);
            });
        }
    });
}

 function addEditableElement(container, value, apartado) {
     let element = $(`
         <div class="valor d-flex justify-content-between align-items-center mt-2">
             <p class="text-align-center me-2" contenteditable="true">${value}</p>
             <button class="btn btn-danger btn-sm delete-button">Eliminar</button>
         </div>
     `);
     container.append(element);

     // Manejar eliminación
     element.find('.delete-button').on('click', function() {
         $.ajax({
             url: '/api/values',
             method: 'DELETE',
             contentType: 'application/json',
             data: JSON.stringify({ apartado: apartado, value: value }),
             success: function() {
                 element.remove();
             },
             error: function() {
                 alert('Error al eliminar el valor.');
             }
         });
     });

     // Manejar edición
     element.find('p').on('blur', function() {
         let updatedValue = $(this).text();
         $.ajax({
             url: '/api/values',
             method: 'PUT',
             contentType: 'application/json',
             data: JSON.stringify({ apartado: apartado, old_value: value, new_value: updatedValue }),
             success: function() {
                 value = updatedValue; // Actualizar el valor en la base de datos
             },
             error: function() {
                 alert('Error al actualizar el valor.');
             }
         });
     });
 }

 export function newElement() {
     let apartado = $(this).closest('.campo').data('apartado');
     let newValue = prompt(`Ingrese un nuevo valor para ${apartado}:`);
     if (newValue) {
         $.ajax({
             url: '/api/values',
             method: 'POST',
             contentType: 'application/json',
             data: JSON.stringify({ apartado: apartado, value: newValue }),
             success: function() {
                 let container = $(`[data-apartado="${apartado}"] .valores-container`);
                 addEditableElement(container, newValue, apartado);
             },
             error: function() {
                 alert('Error al agregar el valor.');
             }
         });
     }
 }