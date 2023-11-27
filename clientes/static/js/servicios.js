$("#btnNuevoServicios").click(function () {
    $("#formServicios").trigger("reset");
    $(".modal-header").css("background-color", "#28a745");
    $(".modal-header").css("color", "white");
    $(".modal-title").text("Nuevo Servicio");
    $("#btnSubmitServicio").text("Guardar");
    $("#formServicios").attr("data-action", "guardar");
    $("#modalNuevoServicio").modal("show");
});

$(document).ready(async function () {
    await initDataTable();
});

let dataTable;
let dataTableInicializada = false;

const initDataTable = async () => {
    // Si ya se inicializó un DataTable, destruirlo antes de reemplazarlo
    if (dataTableInicializada) {
        dataTable.destroy();
    }
    // Cargar datos y llenar la tabla
    await cargarYMostrarServicios();

    // Inicializar el DataTable en el elemento #Zonas
    dataTable = $('#Servicios').DataTable({
        scrollX: true,
        // lenguaje
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
            "sProcessing": "Procesando...",
        },
        "columnDefs": [{
            "targets": 4,
            "data": null,
            "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-outline-info btnEditar'><i class='bx bx-edit'></i></button><button class='btn btn-outline-danger btnEliminar'><i class='bx bx-trash'></i></button></div></div>"
        }],
    });

    // Marcar el DataTable como inicializado
    dataTableInicializada = true;
};

const servicios = async () => {
    try {
        // Cargar datos y llenar la tabla
        await servicios();
    } catch (ex) {
        console.error(ex);
        alert("Hubo un problema al cargar y mostrar las zonas.");
    }
};

$(document).ready(function () {
    $("#formServicios").on("submit", function (event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8000/servicios/",
            data: $(this).serialize(),
            success: function (response) {
                Swal.fire(
                    'Perfecto!',
                    response.message,
                    'success'
                );
                $("#modalNuevoServicio").modal("hide");
                cargarYMostrarServicios();
            },
            error: function (error) {
                console.log("Error:", error);
            }
        });
    });
});

const cargarYMostrarServicios = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/cargar_servicios/');
        const data = await response.json();

        if (data && data.servicios) {
            const contenido = data.servicios.map((servicio) => `
                <tr>
                    <td>${servicio.idServicio}</td>
                    <td>${servicio.monto}</td>
                    <td>${servicio.tipo_plan}</td>
                    <td>${servicio.cantidad_megas}</td>
                    <td>
                        <div class='text-center'>
                            <div class='btn-group'>
                                <button class='btn btn-outline-info btnEditar'><i class='bx bx-edit'></i></button>
                                <button class='btn btn-outline-danger btnEliminar' data-id='${servicio.idServicio}'><i class='bx bx-trash'></i></button>
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('');

            $('#tablaServicios').html(contenido);


            $(document).on("click", ".btnEliminar", function () {
                // Obtén el ID del servicio desde el botón de eliminar
                var servicioId = $(this).closest("tr").find("td:first").text();

                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Lógica para eliminar el servicio
                        eliminarServicio(servicioId);
                    }
                });
            });
        } else {
            console.error('La respuesta del servidor no es un objeto JSON válido o no contiene la propiedad "servicios".');
        }
    } catch (ex) {
        console.error(ex);
        alert("Hubo un problema al cargar los servicios.");
    }
};


const eliminarServicio = async (servicioId) => {
    try {
        const url = `http://127.0.0.1:8000/eliminar_servicio/${servicioId}/`;
        const csrfToken = $('[name=csrfmiddlewaretoken]').val();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        const responseData = await response.json();

        if (response.ok) {
            Swal.fire(
                '¡Eliminado!',
                responseData.success,
                'success'
            );
            cargarYMostrarServicios(); // Recargar la tabla después de la eliminación
        } else {
            console.error(responseData.error);
            Swal.fire(
                'Error!',
                'Hubo un problema al eliminar el servicio.',
                'error'
            );
        }
    } catch (ex) {
        console.error(ex);
        alert("Hubo un problema al realizar la solicitud de eliminación del servicio.");
    }
};


$(document).on("click", ".btnEditar", function () {
    // Obtener los valores del servicio que se va a editar
    var servicioId = $(this).closest("tr").find("td:first").text();
    var monto = $(this).closest("tr").find("td:eq(1)").text().trim();
    var tipoPlan = $(this).closest("tr").find("td:eq(2)").text().trim();
    var cantidadMegas = $(this).closest("tr").find("td:eq(3)").text().trim();

    // Llenar el formulario de edición con los valores obtenidos
    $("#formEdicion #form-edicion-id").val(servicioId);
    $("#formEdicion #id_monto").val(monto);
    $("#formEdicion #id_tipo_plan").val(tipoPlan);
    $("#formEdicion #id_cantidad_megas").val(cantidadMegas);

    $("#modalEdicionServicioLabel").text("Editar Servicio");
    $("#btnSubmit").text("Guardar");
    $("#modalEdicionServicio").modal("show");
});

// Controlador de eventos para el formulario de edición
$(document).ready(function () {
    $("#formEdicion").on("submit", function (event) {
        event.preventDefault();
        // Obtener el valor del campo de ID
        var servicioId = $("#form-edicion-id").val();

        // Comprobar si el ID es válido antes de enviar la solicitud
        if (servicioId) {
            $.ajax({
                type: "POST",
                url: "http://127.0.0.1:8000/editar_servicio/" + servicioId + "/",
                data: $(this).serialize(),
                success: function (response) {
                    console.log(response);
                    Swal.fire(
                        "Perfecto!",
                        response.success,
                        "success"
                    );
                    $("#modalEdicionServicio").modal("hide");

                    // Después de editar el servicio, cargar y mostrar los servicios actualizados
                    cargarYMostrarServicios();
                },
                error: function (error) {
                    console.log("Error:", error);
                }
            });
        } else {
            // Manejar el caso en el que el ID no es válido
            console.log("ID de servicio no válido");
        }
    });
});