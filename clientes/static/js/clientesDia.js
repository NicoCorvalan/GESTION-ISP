//alta con jquery
$("#btnNuevo").click(function () {
    $("#formClientes").trigger("reset");
    $(".modal-header").css("background-color", "#28a745");
    $(".modal-header").css("color", "white");
    $(".modal-title").text("Nuevo Cliente");
    $("#btnSubmit").text("Guardar");
    $("#formClientes").attr("data-action", "guardar");
    $("#modalCRUD").modal("show");
});

$(document).ready(function () {
    $("#formClientes").on("submit", function (event) {
        event.preventDefault();

        $.ajax({
            type: "POST",
            url: "/registro/",
            data: $(this).serialize(),
            success: function (response) {
                Swal.fire(
                    'Perfecto!',
                    response.success,
                    'success'
                )
                $("#modalCRUD").modal("hide")
                initDataTable()
            },
            error: function (error) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Algo salio mal",
                });
            }
        })
    })
})


let idCliente = null;
//botón INFO  
$(document).on("click", ".btnInfo", function () {
    var fila = $(this).closest("tr");
    idCliente = fila.find('td:eq(0)').text(); // Obtener el ID del cliente

    fetch('/cargar_clientes/')
        .then(response => response.json())
        .then(data => {
            var cliente = data.clientes.find(c => c.id === parseInt(idCliente)); // Buscar el cliente por su ID
            // Actualizar los elementos del modal con los datos del cliente
            $("#id-i").text(idCliente);
            $("#dni-i").text(cliente.dni);
            $("#nombre-i").text(cliente.nombre);
            $("#apellido-i").text(cliente.apellido);
            $("#direccion-i").text(cliente.direccion);
            $("#telefono-i").text(cliente.telefono);
            $("#router-i").text(cliente.router);
            $("#numero-serie-i").text(cliente.n_serie);
            // Mostrar el estado como un icono de FontAwesome
            var estadoElement = $("#estado-i");
            estadoElement.empty(); // Limpia el contenido existente
            if (cliente.estado == 'A') {
                estadoElement.append('<i class="fas fa-check-circle text-success"></i>');
            } if (cliente.estado == 'B') {
                estadoElement.append('<i class="fas fa-times-circle text-danger"></i>');
            } if (cliente.estado == 'S') {
                estadoElement.append('<i class="fas fa-circle-exclamation text-warning"></i>')
            }
            $("#observaciones-i").text(cliente.observaciones);
            $("#fechaAlta-i").text(cliente.fecha_alta);
            $("#servicio-i").text(cliente.servicio__tipo_plan);
            $("#monto-i").text("$" + cliente.servicio__monto);
            $("#zona-i").text(cliente.zona__nombre);
            var deudaInfo = "";
            cliente.deudas.forEach(deuda => {
                if (deuda.pagado == false) {
                    deudaInfo += "$" + deuda.monto + " Mes: " + deuda.mes_deuda + "<br>";
                }
            });
            $("#deuda-i").html(deudaInfo);

            if (cliente.estado == 'B') {
                $("#btnBaja").removeClass("btn-danger").addClass("btn-success").text("Alta");
                $("#btnBaja").attr("id", "btnAlta");
                $("#btnSuspender").hide();
            } else {
                $("#btnAlta").removeClass("btn-success").addClass("btn-danger").text("Baja");
                $("#btnAlta").attr("id", "btnBaja");
                $("#btnSuspender").show();
            }

            if (cliente.estado == 'S') {
                $("#btnBaja").removeClass("btn-danger").addClass("btn-success").text("Alta");
                $("#btnBaja").attr("id", "btnAlta");
                $("#btnSuspender").hide();

            }

            $(".modal-title").text("Informacion de Cliente");
            $("#modal-info").modal("show");
        })
        .catch(error => console.error(error));
});

//boton editar
$(document).on("click", "#btnEditar", function () {
    // Obtener los valores del modal de información del cliente
    var id = $("#id-i").text().trim();
    var dni = $("#dni-i").text().trim();
    var nombre = $("#nombre-i").text().trim();
    var apellido = $("#apellido-i").text().trim();
    var direccion = $("#direccion-i").text().trim();
    var telefono = $("#telefono-i").text().trim();
    var estado = $("#estado-i").text().trim();
    console.log(estado)
    var router = $("#router-i").text().trim();
    var n_serie = $("#numero-serie-i").text().trim();
    var observaciones = $("#observaciones-i").text().trim();
    var fecha_alta = $('#fechaAlta-i').text().trim();
    var servicio = $("#servicio-i").text().trim();
    var zona = $("#zona-i").text().trim();

    // Llenar el modal de edición con los valores obtenidos
    $("#formEdicion #form-edicion-id").val(id)
    $("#formEdicion #dni").val(dni);
    $("#formEdicion #nombre").val(nombre);
    $("#formEdicion #apellido").val(apellido);
    $("#formEdicion #direccion").val(direccion);
    $("#formEdicion #telefono").val(telefono);
    $("#formEdicion #router").val(router);
    $("#formEdicion #n_serie").val(n_serie);
    $("#formEdicion #estado").val(estado);
    $("#formEdicion #observaciones").val(observaciones);
    $('#formEdicion #fecha_alta').val(fecha_alta);
    $("#formEdicion #servicio option:contains('" + servicio + "')").prop("selected", true);
    $("#formEdicion #zona option:contains('" + zona + "')").prop("selected", true);

    $("#titulo-edicion").text("Editar Cliente");
    $("#btnSubmit").text("Guardar");
    $("#modal-edicion-crud").modal("show");

    $(document).ready(function () {
        $("#formEdicion").on("submit", function (event) {
            event.preventDefault();

            $.ajax({
                type: "POST",
                url: "/editar/",
                data: $(this).serialize(),
                success: function (response) {
                    Swal.fire(
                        'Perfecto!',
                        response.success,
                        'success'
                    )
                    $("#modal-edicion-crud").modal("hide")
                    actualizarTabla()
                    $("#modal-info").modal("hide")
                }
            })
        })
    })


});

$(document).on("click", "#btnBaja", async function () {
    var id = $("#id-i").text().trim();

    try {
        Swal.fire({
            title: 'Estas seguro?',
            text: "Estas por dar de baja un cliente",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, realizar baja!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const csrfToken = $("meta[name=csrf-token]").attr("value");  // Obtener el token CSRF
                console.log(csrfToken)
                const response = fetch(`/baja/${id}/`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,  // Agregar el token CSRF como encabezado
                    },
                });
                Swal.fire(
                    'Baja exitosa!',
                    "Tu cliente fue dado de baja!",
                    'success'
                )
                $("#modal-info").modal("hide")
            }
        })
    } catch (error) {
        // Manejar el error en caso de un problema con la petición Fetch
    }
});

$(document).on("click", "#btnAlta", async function () {
    var id = $("#id-i").text().trim();

    try {
        const csrfToken = $("meta[name=csrf-token]").attr("value");  // Obtener el token CSRF
        console.log(csrfToken)
        const response = await fetch(`/alta/${id}/`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,  // Agregar el token CSRF como encabezado
            },
        });
        if (response.ok) {
            Swal.fire(
                'Perfecto!',
                'Tu cliente fue dado de alta!',
                'success'
            )
            $("#modal-info").modal("hide")
        }
    } catch (error) {
        // Manejar el error en caso de un problema con la petición Fetch
    }
});

$(document).on("click", "#btnSuspender", async function () {
    var id = $("#id-i").text().trim();

    try {
        Swal.fire({
            title: 'Estas seguro?',
            text: "Estas suspender un cliente",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, suspender cliente!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const csrfToken = $("meta[name=csrf-token]").attr("value");  // Obtener el token CSRF
                console.log(csrfToken)
                const response = fetch(`/suspender/${id}/`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,  // Agregar el token CSRF como encabezado
                    },
                });
                Swal.fire(
                    'Suspencion exitosa!',
                    "Tu cliente fue suspendido!",
                    'success'
                )
                $("#modal-info").modal("hide")
            }
        })
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        // Manejar el error en caso de un problema con la petición Fetch
    }
});

let dataTable;
let dataTableInicializada = false;

const initDataTable = async () => {
    // Si ya se inicializó un DataTable, destruirlo antes de reemplazarlo
    if (dataTableInicializada) {
        dataTable.destroy();
    }

    // Cargar datos y llenar la tabla
    await clientes();

    // Inicializar el DataTable en el elemento #tablaClientes
    dataTable = $('#ClientesAlDia').DataTable({
        scrollX: true,
        // botones editar y eliminar en la tabla
        "columnDefs": [{
            "targets": 4,
            "data": null,
            //se agrego el boton registrar el pago
            "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-outline-info btnInfo'><i class='bx bx-plus-circle'></i></button><button id='btnPago' class='btn btn-outline-success btnRegistrarPago'><i class='bx bx-dollar-circle'></i></button></div></div>"
        }],
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


const clientes = async () => {
    try {
        const response = await fetch('/clientes_aldia/');
        const data = await response.json()
        console.log(data)
        let contenido = ''
        data.clientes.forEach((cliente, index) => {
            contenido += `
            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.apellido}</td>
                <td>${cliente.nombre}</td>
                <td></td>
            </tr>
            `;
        });
        tablaClientesDia.innerHTML = contenido;
    } catch (ex) {
        alert(ex);
    }
};
window.addEventListener('load', async () => {
    await initDataTable();
});

const actualizarTabla = async () => {
    await clientes();
    dataTable.clear().rows.add($("#ClientesAlDia tbody tr")).draw();
}


$(document).on("click", ".btnRegistrarPago", function () {
    // Obtén el ID de la fila actual
    var fila = $(this).closest("tr");
    var idCliente = fila.find('td:eq(0)').text();
    var nombre = fila.find('td:eq(2)').text();
    var apellido = fila.find('td:eq(3)').text();

    // Realiza la solicitud para cargar la información del cliente
    fetch('/clientes_aldia/')
        .then(response => response.json())
        .then(data => {
            // Encuentra el cliente en los datos cargados
            var cliente = data.clientes.find(c => c.id === parseInt(idCliente));

            // Construye una cadena con las deudas del cliente
            var deudas = " ";
            var primerMesDeuda = null;
            var monto = 0
            cliente.deudas.forEach(deuda => {
                if(!deuda.pagado && primerMesDeuda === null){
                    primerMesDeuda = deuda.mes_deuda
                }
                if(!deuda.pagado){
                    deudas += deuda.mes_deuda + "<br>" ;
                    monto = deuda.monto
                }
            });

            // Inserta la cadena de deudas en el elemento con id "meses-deuda"
            $("#meses-deuda").html(deudas);
            $("#mes").val(primerMesDeuda)
            $("#monto").val(monto)

            // Abre el modal
            $("#tituloPago").text("Registrar pago de " + nombre + " " + apellido);
            $("#modalPago").modal("show");

            // Asocia el clic al botón dentro del modal
            $("#btnPagar").off("click").on("click", function () {
                // Obtiene los datos del formulario y agrega el ID del cliente
                var formData = $("#form-pago").serialize();
                formData += "&cliente_id=" + idCliente;

                // Realiza la solicitud AJAX
                $.ajax({
                    type: "POST",
                    url: "/pagar_deuda/",
                    data: formData,
                    success: function (response) {
                        console.log(response);
                        $("#modalPago").modal("hide");
                        Swal.fire(
                            'Perfecto!',
                            response.message,
                            'success'
                        );
                        actualizarTabla()
                    },
                    error: function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Algo salio mal",
                        });
                    }
                });
            });
        })
        .catch(error => console.error(error));
});


$(document).on("click", "#btnInfoPagos", function () {
    idCliente = $("#id-i").text().trim();

    fetch('/cargar_clientes/')
        .then(response => response.json())
        .then(data => {
            var cliente = data.clientes.find(c => c.id === parseInt(idCliente));

            // Limpiar el contenido del modal
            $("#pagos tbody").empty();
            $("#pagination").empty();

            // Llenar la tabla con los datos de pagos
            const pageSize = 5; // Número de elementos por página
            const pageCount = Math.ceil(cliente.deudas.length / pageSize); // Número total de páginas
            let currentPage = 1; // Página actual

            function showData(page) {
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const pageData = cliente.deudas.slice(startIndex, endIndex);

                pageData.forEach(deuda => {
                    const estadoIcon = deuda.pagado === true ? '<i class="fas fa-check-circle text-success"></i>' :
                        deuda.pagado === false ? '<i class="fas fa-times-circle text-danger"></i>' : '';

                    $("#pagos tbody").append(`
                        <tr>
                            <td class="text-center align-middle">${deuda.mes_deuda}</td>
                            <td class="text-center align-middle">${estadoIcon}</td>
                            <td class="text-center align-middle">$${deuda.monto_pagado !== null ? deuda.monto_pagado :'0'}</td>
                            <td class="text-center align-middle">$${deuda.monto !== null ? deuda.monto :'0'}</td>
                            <td class="text-center align-middle">${deuda.fecha_pago !== null ? deuda.fecha_pago :'/'}</td>
                        </tr>
                    `);
                });
            }

            showData(currentPage);

            // Agregar botones de paginación
            for (let i = 1; i <= pageCount; i++) {
                $("#pagination").append(`<button class="btn btn-primary page-link">${i}</button>`);
            }

            // Función para cambiar de página al hacer clic en un botón de paginación
            $("#pagination").on("click", ".page-link", function () {
                currentPage = parseInt($(this).text());
                $("#pagos tbody").empty();
                showData(currentPage);
            });

            // Ocultar el modal de información y mostrar el modal de historial de pagos
            $("#modal-info").modal("hide");
            $(".modal-title").text("Pagos realizados");
            $("#modalHistorialPagos .modal-header");
            $("#modalHistorialPagos").modal("show");
        })
        .catch(error => console.error(error));
});


$(document).ready(function () {
    $('#año').val(new Date().getFullYear());
    $('#id_año_deuda').val(new Date().getFullYear());
});
