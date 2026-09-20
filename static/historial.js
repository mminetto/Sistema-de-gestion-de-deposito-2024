export function updateOperations() {
    $.ajax({
        url: '/api/get_operations',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const container = $('#operationContainer');
            container.empty(); // Limpiar contenido previo
    
            // Crear estructuras para agrupar por fecha
            const todayOperations = [];
            const yesterdayOperations = [];
            const last7DaysOperations = [];
    
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
    
            data.forEach(function(row) {
                const operationDate = new Date(row.fecha_hora);
                const operationDay = new Date(operationDate.getFullYear(), operationDate.getMonth(), operationDate.getDate());
    
                if (operationDay.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
                    todayOperations.push(row);
                } else if (operationDay.getTime() === new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime()) {
                    yesterdayOperations.push(row);
                } else if (operationDay.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).getTime()) {
                    last7DaysOperations.push(row);
                }
            });
    
            function renderOperations(operations, sectionTitle) {
                if (operations.length > 0) {
                    container.append(`<h3>${sectionTitle}</h3>`);
    
                    // Crear un objeto para agrupar por proceso_id
                    const groupedData = {};
        
                        operations.forEach(function(row) {
                        if (!groupedData[row.proceso_id]) {
                            groupedData[row.proceso_id] = {
                                fecha_hora: row.fecha_hora,
                                usuario: row.usuario,
                                operacion: row.operacion,
                                items: []
                            };
                        }
                        groupedData[row.proceso_id].items.push({
                            modelo: row.items,
                            categoria: row.categoria
                        });
                    });
    
                    // Ahora iteramos sobre los grupos y los mostramos en el HTML
                    // Ahora iteramos sobre los grupos y los mostramos en el HTML
for (let proceso_id in groupedData) {       
const operation = groupedData[proceso_id];
let itemsHtml = '';

operation.items.forEach(function(item) {
    itemsHtml += `
        <div>
            <span class="item-category">${item.categoria}</span> - 
            <span class="items">${item.modelo}</span>
        </div>
    `;
});

// Aquí es donde decides qué SVG mostrar según el tipo de operación
let operationIconHtml = '';
if (operation.operacion === 'Ingreso') {

    operationIconHtml = `<svg class="rotate-svg" height="40px" width="40px"  version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                             viewBox="0 0 512 512" xml:space="preserve">
                        <path style="fill:rgba(36, 38, 45, 0.938);" d="M395.47,296.3H116.531c-36.816,0-57.855-42.009-35.803-71.491L225.983,30.621
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
                        </svg>`; // Reemplaza este ícono por tu SVG de "Ingreso"
} else if (operation.operacion === 'Retiro') {

    operationIconHtml = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
 viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:rgba(36, 38, 45, 0.69);" d="M395.47,296.3H116.531c-36.816,0-57.855-42.009-35.803-71.491L225.983,30.621
c14.993-20.043,45.041-20.043,60.034,0l145.254,194.188C453.325,254.291,432.286,296.3,395.47,296.3z"/>
<path style="fill:#b0949a;" d="M443.755,215.471L298.501,21.284C288.382,7.759,272.893,0,256.001,0s-32.383,7.759-42.5,21.284
L68.245,215.471c-13.759,18.393-15.916,42.579-5.631,63.119c10.286,20.54,30.946,33.298,53.916,33.298h66.552
C185.227,422.598,275.94,512,387.153,512c8.608,0,15.589-6.979,15.589-15.589V381.652c0-8.61-6.981-15.589-15.589-15.589
c-14.01,0-27.556-5.074-38.144-14.29c-6.494-5.651-16.339-4.971-21.993,1.525c-5.653,6.494-4.97,16.34,1.525,21.993
c12.293,10.699,27.185,17.765,43.025,20.577v84.258c-86.772-7.791-155.289-79.949-157.307-168.237H395.47
c22.97,0,43.63-12.759,53.917-33.298C459.671,258.052,457.514,233.866,443.755,215.471z M421.509,264.629
c-5.043,10.069-14.777,16.081-26.04,16.081H116.53c-11.261,0-20.995-6.011-26.038-16.081c-5.043-10.07-4.027-21.466,2.72-30.484
L238.466,39.957c4.173-5.581,10.565-8.781,17.534-8.78    1c6.97,0,13.36,3.2,17.534,8.781l145.254,194.188
C425.534,243.165,426.551,254.56,421.509,264.629z"/>
</svg>`; // Reemplaza este ícono por tu SVG de "Retiro"
}

const operationHtml = `
    <div class="operation-item">
        <div class="operation-left-icon">
            ${operationIconHtml} <!-- Aquí se inserta el ícono correspondiente -->
        </div>
        <div class="operation-details">
            ${itemsHtml}
            <div class="operation-user-date">
                <span class="user-name">${operation.usuario} | </span>
                <span class="operation-date">${operation.fecha_hora}</span>
            </div>
        </div>
        <div class="operation-right-icon row">
            

            <a class="col"  href="#"><svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.0001H21V19.0001C21 20.1047 20.1046 21.0001 19 21.0001M17 13.0001V19.0001C17 20.1047 17.8954 21.0001 19 21.0001M17 13.0001V5.75719C17 4.8518 17 4.3991 16.8098 4.13658C16.6439 3.90758 16.3888 3.75953 16.1076 3.72909C15.7853 3.6942 15.3923 3.9188 14.6062 4.368L14.2938 4.54649C14.0045 4.71183 13.8598 4.7945 13.7062 4.82687C13.5702 4.85551 13.4298 4.85551 13.2938 4.82687C13.1402 4.7945 12.9955 4.71183 12.7062 4.54649L10.7938 3.45372C10.5045 3.28838 10.3598 3.20571 10.2062 3.17334C10.0702 3.14469 9.92978 3.14469 9.79383 3.17334C9.64019 3.20571 9.49552 3.28838 9.20618 3.45372L7.29382 4.54649C7.00448 4.71183 6.85981 4.7945 6.70617 4.82687C6.57022 4.85551 6.42978 4.85551 6.29383 4.82687C6.14019 4.7945 5.99552 4.71183 5.70618 4.54649L5.39382 4.368C4.60772 3.9188 4.21467 3.6942 3.89237 3.72909C3.61123 3.75953 3.35611 3.90758 3.1902 4.13658C3 4.3991 3 4.8518 3 5.75719V16.2001C3 17.8803 3 18.7203 3.32698 19.3621C3.6146 19.9266 4.07354 20.3855 4.63803 20.6731C5.27976 21.0001 6.11984 21.0001 7.8 21.0001H19M7 13.0001H9M7 9.0001H13M7 17.0001H9M13 17.0001H13.01M13 13.0001H13.01" stroke="#94AFB0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg></a>
            </button>
        </div>
    </div>
`;
container.append(operationHtml);

}

                }
            }
    
            renderOperations(todayOperations, 'Hoy');
            renderOperations(yesterdayOperations, 'Ayer');
            renderOperations(last7DaysOperations, 'Últimos 7 días');
        },
        error: function(xhr, status, error) {
            console.error('Error fetching operations:', error);
        }
    });
    

}
