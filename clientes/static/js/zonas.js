$("#btnNuevaZona").click(function () {
    $("#formZonas").trigger("reset");
    $(".modal-header");
    $(".modal-title").text("Nueva Zona");
    $("#btnSubmit").text("Guardar");
    $("#formZonas").attr("data-action", "guardar");
    $("#modalCRUD").modal("show");
});

let dataTable;
let dataTableInicializada = false;

const initDataTable = async () => {
    // Si ya se inicializó un DataTable, destruirlo antes de reemplazarlo
    if (dataTableInicializada) {
        dataTable.destroy();
    }

    // Cargar datos y llenar la tabla
    await cargarYMostrarZonas();

    // Inicializar el DataTable en el elemento #Zonas
    dataTable = $('#Zonas').DataTable({
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
        }
    });

    // Marcar el DataTable como inicializado
    dataTableInicializada = true;
};

const zonas = async () => {
    try {
        const response = await fetch('/cargar_zonas/');
        const data = await response.json();
        console.log(data);

        let contenido = '';
        data.zonas.forEach((zona, index) => {
            contenido += `
            <tr>
                <td>${zona.id}</td>
                <td>${zona.nombre}</td>
                <!-- Agrega aquí otros campos necesarios -->
                <td class="text text-center">
                <button class='btn btn-outline-info btnEditarZona' data-id="${zona.id}" data-nombre="${zona.nombre}"><i class='bx bx-edit'></i></button>
                    <button class='btn btn-outline-danger btnEliminar' data-id="${zona.id}"><i class='bx bx-trash'></i></button>
                </td>
            </tr>
            `;
        });

        $('#tablaZonas').html(contenido);

        // Agrega eventos a los botones de editar y eliminar

        $(".btnEditarZona").click(function () {
            const zonaId = $(this).data("id");
            // Lógica para abrir el modal de edición con los detalles de la zona
            cargarDatosZona(zonaId);
        });
        

        $(".btnEliminar").click(function () {
            const zonaId = $(this).data("id");
        
            // Mostrar un cuadro de confirmación con SweetAlert
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
                    // Lógica para eliminar la zona
                    eliminarZona(zonaId);
                }
            });
        });
    } catch (ex) {
        alert(ex);
    }
};

const cargarYMostrarZonas = async () => {
    try {
        // Cargar datos y llenar la tabla
        await zonas();
    } catch (ex) {
        console.error(ex);
        alert("Hubo un problema al cargar y mostrar las zonas.");
    }
};

$(document).ready(function () {
    $("#formZonas").on("submit", function (event) {
        event.preventDefault();

        $.ajax({
            type: "POST",
            url: "/zonas/",
            data: $(this).serialize(),
            success: function (response) {
                Swal.fire(
                    'Perfecto!',
                    response.success,
                    'success'
                );
                $("#modalCRUD").modal("hide");
                cargarYMostrarZonas();
            },
            error: function (error) {
                console.error(error);
                Swal.fire(
                    'Error!',
                    'Hubo un problema al guardar la zona.',
                    'error'
                );
            }
        });
    });
});

const eliminarZona = async (zonaId) => {
    try {
        const url = `/eliminar_zona/${zonaId}/`; // URL de eliminación
        const csrfToken = $('[name=csrfmiddlewaretoken]').val(); // Obtener el token CSRF del formulario

        const response = await fetch(url, {
            method: 'DELETE',
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
            cargarYMostrarZonas(); // Recargar la tabla después de la eliminación
        } else {
            console.error(responseData.error);
            Swal.fire(
                'Error!',
                'Hubo un problema al eliminar la zona.',
                'error'
            );
        }
    } catch (ex) {
        console.error(ex);
        alert("Hubo un problema al realizar la solicitud de eliminación.");
    }
};


window.addEventListener('load', async () => {
    await initDataTable();
});

const cargarDatosZona = async (zonaId) => {
    try {
        const response = await fetch(`/cargar_zona/${zonaId}/`);

        const zona = await response.json();

        // Llenar el modal de edición con los valores obtenidos
        $("#formEdicionZona #form-edicion-id").val(zona.id);
        $("#formEdicionZona #nombre").val(zona.nombre);
        $("#formEdicionZona #latitud").val(zona.latitud);
        $("#formEdicionZona #longitud").val(zona.longitud);

        $("#titulo-edicion-zona").text("Editar Zona");
        $("#btnGuardarEdicionZona").text("Guardar");
        $("#modalEdicionZona").modal("show");
    } catch (ex) {
        console.error(ex);
        alert("Hubo un problema al cargar los datos de la zona.");
    }
};

$(document).ready(function () {
    $("#formEdicionZona").on("submit", function (event) {
        event.preventDefault();

        $.ajax({
            type: "POST",
            url: "/editar_zona/", // Ajusta la URL según tu configuración
            data: $(this).serialize(),
            success: function (response) {
                console.log(response);
                Swal.fire(
                    'Perfecto!',
                    response.success,
                    'success'
                );
                $("#modalEdicionZona").modal("hide");
                cargarYMostrarZonas();
            }
        });
    });
});



