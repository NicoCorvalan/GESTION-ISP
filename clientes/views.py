from django.shortcuts import render, redirect, get_object_or_404
from .forms import ClienteForm, DeudaForm, ServiciosForm, LoginForm, ZonasForm, TicketsForm
from .models import Servicio, Zona, Cliente, Deuda, ClienteDeuda
from django.http.response import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal
from datetime import datetime, timedelta
from io import BytesIO
from collections import defaultdict
from django.http import HttpResponse
from PyPDF2 import PdfReader, PdfWriter
from django.template.loader import render_to_string
from xhtml2pdf import pisa
import os


# Create your views here.


def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)

            if user:
                login(request, user)
                return redirect("home")
            else:
                form.add_error(
                    None,
                    "Usuario y/o Contraseña Incorrecta. Por favor, inténtalo de nuevo.",
                )
    else:
        form = LoginForm()

    return render(request, "users/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("login")


@login_required(login_url="login")
def home(request):
    clientes = Cliente.objects.count()
    clientes_deudas = (
        ClienteDeuda.objects.filter(pagado=False).values("cliente").distinct().count()
    )
    clientes_al_dia = clientes - clientes_deudas
    return render(
        request,
        "home.html",
        {"clientes": clientes, "deudores": clientes_deudas, "alDia": clientes_al_dia},
    )


# Esta Funcion carga el total de clientes para enviarlos al Template
def cargar_clientes(request):
    clientes = Cliente.objects.all()
    data = []
    for cliente in clientes:
        deudas_data = []
        for cd in cliente.clientedeuda_set.all(): # type: ignore
            deuda_info = {
                "mes_deuda": cd.deuda.mes_deuda,
                "año_deuda": cd.deuda.año_deuda,
                "fecha_pago": cd.fecha_pago,
                "monto_pagado": cd.monto_pagado,
                "pagado": cd.pagado,
                "monto": cd.monto,
            }
            deudas_data.append(deuda_info)
    
        cliente_data = {
            "id": cliente.id, # type: ignore
            "dni": cliente.dni,
            "apellido": cliente.apellido,
            "nombre": cliente.nombre,
            "direccion": cliente.direccion,
            "telefono": cliente.telefono,
            "estado": cliente.estado,
            "router": cliente.router,
            "n_serie": cliente.n_serie,
            "observaciones": cliente.observaciones,
            "fecha_alta": cliente.fecha_alta,
            "servicio__tipo_plan": cliente.servicio.tipo_plan,
            "servicio__monto": cliente.servicio.monto,
            "zona__nombre": cliente.zona.nombre,
            "deudas": deudas_data,
        }
        data.append(cliente_data)

    return JsonResponse({"clientes": data})


# Esta funcion registra los clientes y persiste los datos
@login_required(login_url="login")
def renderizar(request):
    form_deuda = DeudaForm(request.POST or None)
    formulario = ClienteForm(request.POST or None)
    servicios = Servicio.objects.all()
    zonas = Zona.objects.all()
    if formulario.is_valid():
        formulario.save()
        print("todo esta bien")
        return JsonResponse({"success": "Cliente guardado con exito"}, status=200)
    else:
        print(formulario.errors)
    contexto = {
        "formulario": formulario,
        "servicios": servicios,
        "zonas": zonas,
        "form_deuda": form_deuda,
    }
    return render(request, "Clientes.html", contexto)


def registrar(request):
    formulario = ClienteForm(request.POST or None)
    if formulario.is_valid():
        formulario.save()
        print("todo esta bien")
        return JsonResponse({"success": "Cliente guardado con exito"}, status=200)
    else:
        return JsonResponse({"error": "formulario incorrecto"}, status=405)


# Editar clientes
def editar(request):
    id = request.POST.get("form-edicion-id")
    cliente = Cliente.objects.get(id=id)
    formulario = ClienteForm(request.POST, instance=cliente)
    if formulario.is_valid():
        formulario.save()
        return JsonResponse({"success": "Cliente editado con exito"})
    print(formulario.errors)
    return redirect("clientes")


def baja_logica(request, id):
    if request.method == "POST":
        cliente = Cliente.objects.get(id=id)
        cliente.estado = "B"
        cliente.save()
        return JsonResponse({"message": "Baja realizada correctamente"})


def alta(request, id):
    if request.method == "POST":
        cliente = Cliente.objects.get(id=id)
        cliente.estado = "A"
        cliente.save()
        return JsonResponse({"message": "Alta exitosa"})


def suspender_cliente(request, id):
    if request.method == "POST":
        cliente = Cliente.objects.get(id=id)
        cliente.estado = "S"
        cliente.save()
        return JsonResponse({"message": "Suspendido exitosamente"})


def generar_deuda(request):
    form_deuda = DeudaForm(request.POST or None)
    if form_deuda.is_valid():
        mes = form_deuda.cleaned_data["mes_deuda"]
        año = form_deuda.cleaned_data["año_deuda"]
        clientes = Cliente.objects.all()
        deuda = Deuda(mes_deuda=mes, año_deuda=año)
        deuda.save()
        for cliente in clientes:
            if cliente.estado == "A":
                deuda_anterior = cliente.clientedeuda_set.filter(pagado=False).first()
                if deuda_anterior:
                    deuda_anterior.monto += 100
                    deuda_anterior.save()
                cliente.deudas.add(
                    deuda, through_defaults={"monto": cliente.servicio.monto}
                )
        response_data = {"success": "Deuda generada exitosamente"}
        return JsonResponse(response_data, status=200)
    else:
        response_data = {"error": "Error al generar la deuda"}
        return JsonResponse(response_data, status=400)


@csrf_exempt
def registrar_pago(request):
    import datetime
    if request.method == "POST":
        mes = request.POST.get("mes")
        año = request.POST.get("año")
        pago = Decimal(request.POST.get("monto"))
        cliente_id = request.POST.get("cliente_id")
        cliente = Cliente.objects.get(id=cliente_id)
        deuda = cliente.clientedeuda_set.get(deuda__mes_deuda=mes, deuda__año_deuda=año) # type: ignore
        if pago <= deuda.monto:
            if deuda.monto_pagado is not None:
                deuda.monto_pagado = deuda.monto_pagado + pago
            else:
                deuda.monto_pagado = pago
            if pago == deuda.monto:
                deuda.pagado = True
                deuda.fecha_pago = datetime.datetime.now()
            deuda.monto = deuda.monto - pago
            deuda.save()
            response_data = {"message": "Pago realizado con exito"}
            return JsonResponse(response_data, status=200)
        else:
            response_data = {"error": "El monto ingresado es mayor al adeudado"}
            return JsonResponse(response_data, status=405)

@login_required(login_url="login")
def servicios(request):
    form_servicios = ServiciosForm()
    if request.method == "POST":
        form_servicios = ServiciosForm(request.POST or None)
        if form_servicios.is_valid():
            monto = form_servicios.cleaned_data["monto"]
            tipo_plan = form_servicios.cleaned_data["tipo_plan"]
            cantidad_megas = form_servicios.cleaned_data["cantidad_megas"]
            servicio = Servicio(
                monto=monto, tipo_plan=tipo_plan, cantidad_megas=cantidad_megas
            )
            servicio.save()
            servicio_data = {
                "monto": servicio.monto,
                "tipo_plan": servicio.tipo_plan,
                "cantidad_megas": servicio.cantidad_megas,
            }
            return redirect("servicios")
    else:
        servicios = Servicio.objects.all()
    return render(
        request,
        "servicios.html",
        {"form_servicios": form_servicios, "servicios": servicios},
    )


def cargar_servicios(request):
    servicios = Servicio.objects.all()
    data = []

    for servicio in servicios:
        servicio_data = {
            "idServicio": servicio.idServicio,
            "monto": servicio.monto,
            "tipo_plan": servicio.tipo_plan,
            "cantidad_megas": servicio.cantidad_megas,
            # Agrega aquí otros campos necesarios
        }
        data.append(servicio_data)

    return JsonResponse({"servicios": data})


@csrf_exempt
def eliminar_servicio(request, servicio_id):
    servicio = get_object_or_404(Servicio, idServicio=servicio_id)

    try:
        servicio.delete()
        return JsonResponse({"success": "Servicio eliminado correctamente."})
    except Exception as e:
        return JsonResponse(
            {"error": f"Error al eliminar el servicio: {str(e)}"}, status=500
        )


@csrf_exempt
def editar_servicio(request, servicio_id):
    servicio_id = request.POST.get("id")
    servicio = Servicio.objects.get(idServicio=servicio_id)
    formulario = ServiciosForm(request.POST, instance=servicio)
    if formulario.is_valid():
        formulario.save()
        response_data = {"success": "Servicio editado con éxito"}
        return JsonResponse(response_data, status=200)
    print(formulario.errors)
    return JsonResponse({"error": "Error al editar el servicio"})

@login_required(login_url="login")
def zonas(request):
    form_zonas = ZonasForm()

    if request.method == "POST":
        form_zonas = ZonasForm(request.POST or None)
        if form_zonas.is_valid():
            nombre = form_zonas.cleaned_data["nombre"]
            latitud = form_zonas.cleaned_data["latitud"]
            longitud = form_zonas.cleaned_data["longitud"]

            zona = Zona(nombre=nombre, latitud=latitud, longitud=longitud)
            zona.save()
            return JsonResponse({"success": "Zona guardada con éxito"})
    else:
        zonas = Zona.objects.all()
    return render(request, "zonas.html", {"form_zonas": form_zonas, "zonas": zonas})


def cargar_zonas(request):
    zonas = Zona.objects.all()
    data = []

    for zona in zonas:
        zona_data = {
            "id": zona.id,
            "nombre": zona.nombre,
            "latitud": str(zona.latitud),  # Convertir a str para JSON
            "longitud": str(zona.longitud),
        }
        data.append(zona_data)

    return JsonResponse({"zonas": data})


def eliminar_zona(request, zona_id):
    zona = get_object_or_404(Zona, pk=zona_id)

    try:
        zona.delete()
        return JsonResponse({"success": "Zona eliminada correctamente."})
    except Exception as e:
        return JsonResponse(
            {"error": f"Error al eliminar la zona: {str(e)}"}, status=500
        )


def editar_zona(request):
    if request.method == "POST":
        zona_id = request.POST.get("id")
        zona = get_object_or_404(Zona, pk=zona_id)
        zona.nombre = request.POST.get("nombre")
        zona.latitud = request.POST.get("latitud")
        zona.longitud = request.POST.get("longitud")

        zona.save()
        return JsonResponse({"success": "Zona editada correctamente."})
    else:
        return JsonResponse({"error": "Método no permitido."}, status=405)


def cargar_zona(request, zona_id):
    zona = get_object_or_404(Zona, pk=zona_id)

    zona_data = {
        "id": zona.id,
        "nombre": zona.nombre,
        "latitud": str(zona.latitud),
        "longitud": str(zona.longitud),
    }

    return JsonResponse(zona_data)

@login_required(login_url="login")
def clientes_deuda_render(request):
    form_deuda = DeudaForm(request.POST or None)
    formulario = ClienteForm(request.POST or None)
    servicios = Servicio.objects.all()
    zonas = Zona.objects.all()
    contexto = {
        "formulario": formulario,
        "servicios": servicios,
        "zonas": zonas,
        "form_deuda": form_deuda,}
    return render(request, 'clientedeuda.html', contexto )


def clientes_deudas(request):
    clientes = Cliente.objects.all()
    data = []
    for cliente in clientes:
        deudas_data = []
        for cd in cliente.clientedeuda_set.filter(pagado=False):
            deuda_info = {
                "mes_deuda": cd.deuda.mes_deuda,
                "año_deuda": cd.deuda.año_deuda,
                "fecha_pago": cd.fecha_pago,
                "monto_pagado": cd.monto_pagado,
                "pagado": cd.pagado,
                "monto": cd.monto,
            }
            deudas_data.append(deuda_info)
        if deudas_data:
            cliente_data = {
                "id": cliente.id, # type: ignore
                "dni": cliente.dni,
                "apellido": cliente.apellido,
                "nombre": cliente.nombre,
                "direccion": cliente.direccion,
                "telefono": cliente.telefono,
                "estado": cliente.estado,
                "router": cliente.router,
                "n_serie": cliente.n_serie,
                "observaciones": cliente.observaciones,
                "fecha_alta": cliente.fecha_alta,
                "servicio__tipo_plan": cliente.servicio.tipo_plan,
                "servicio__monto": cliente.servicio.monto,
                "zona__nombre": cliente.zona.nombre,
                "deudas": deudas_data,
            }
            data.append(cliente_data)

    return JsonResponse({"clientes": data})

@login_required(login_url="login")
def clientes_aldia_render(request):
    form_deuda = DeudaForm(request.POST or None)
    formulario = ClienteForm(request.POST or None)
    servicios = Servicio.objects.all()
    zonas = Zona.objects.all()
    contexto = {
        "formulario": formulario,
        "servicios": servicios,
        "zonas": zonas,
        "form_deuda": form_deuda,}
    return render(request, 'clienteAlDia.html', contexto )


def clientes_aldia(request):
    clientes = Cliente.objects.all()
    data = []

    for cliente in clientes:
        todas_pagadas = cliente.clientedeuda_set.exists() and \
                        cliente.clientedeuda_set.filter(pagado=True).count() == cliente.clientedeuda_set.count()

        if todas_pagadas:
            deudas_data = [
                {
                    "mes_deuda": cd.deuda.mes_deuda,
                    "año_deuda": cd.deuda.año_deuda,
                    "fecha_pago": cd.fecha_pago,
                    "monto_pagado": cd.monto_pagado,
                    "pagado": cd.pagado,
                    "monto": cd.monto,
                }
                for cd in cliente.clientedeuda_set.filter(pagado=True)
            ]

            cliente_data = {
                "id": cliente.id,  # type: ignore
                "dni": cliente.dni,
                "apellido": cliente.apellido,
                "nombre": cliente.nombre,
                "direccion": cliente.direccion,
                "telefono": cliente.telefono,
                "estado": cliente.estado,
                "router": cliente.router,
                "n_serie": cliente.n_serie,
                "observaciones": cliente.observaciones,
                "fecha_alta": cliente.fecha_alta,
                "servicio__tipo_plan": cliente.servicio.tipo_plan,
                "servicio__monto": cliente.servicio.monto,
                "zona__nombre": cliente.zona.nombre,
                "deudas": deudas_data,
            }

            data.append(cliente_data)

    return JsonResponse({"clientes": data})

def soporteTecnico(request):

    return render(request, "soporteTecnico.html")

def tickets(request):
    if request.method == 'POST':
        form = TicketsForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('tickets')
    else:
        form = TicketsForm()

    return render(request, "tickets.html", {'form': form})


def generar_factura_pdf(request):
    clientes_deuda = ClienteDeuda.objects.filter(pagado=False)
    clientes = defaultdict(list)
    pdf_buffer = BytesIO()

    # Fecha de emisión (fecha actual)
    fecha_emision = datetime.now().strftime("%d/%m/%Y")
    
    for cliente_deuda in clientes_deuda:
        cliente = cliente_deuda.cliente
        deuda = cliente_deuda.deuda
        monto = cliente_deuda.monto
        clientes[cliente].append((deuda, monto))

    # Generamos el contenido del PDF
    html_content = ""
    for cliente, cliente_deudas in clientes.items():
        mes_deuda = cliente_deudas[0][0].mes_deuda
        total_debt = sum(monto for _, monto in cliente_deudas) - cliente.servicio.monto
        total_monto = sum(monto for _, monto in cliente_deudas)
        additional_text = "Si abona fuera de término deberá abonar $100 de recargo."
        additional_text2 = "Estimados clientes, nos comunicamos con usted para informarle que, luego de los acontecimientos de público conocimiento, nos vemos en la obligación de aplicar una actualización en los precios de los abonados actuales. Dicho ajuste se debe a la necesidad de afrontar los aumentos de costos, tanto en pesos como en dólares."
        
        # Calcular fecha de vencimiento (1 mes después de la fecha de emisión)
        fecha_emision_dt = datetime.strptime(fecha_emision, "%d/%m/%Y")
        fecha_vencimiento_dt = fecha_emision_dt + timedelta(days=30)
        fecha_vencimiento = fecha_vencimiento_dt.strftime("%d/%m/%Y")

        # Renderizamos la plantilla HTML con los datos del cliente y su deuda
        factura_html = render_to_string('factura.html', {
            'cliente': cliente,
            'fecha_emision': fecha_emision,
            'fecha_vencimiento': fecha_vencimiento,
            'mes_deuda': mes_deuda,
            'total_debt': total_debt,
            'total_monto': total_monto,
            'additional_text': additional_text,
            'additional_text2': additional_text2,
        })
        
        html_content += factura_html
        html_content += '<div style="page-break-after:always;"></div>'  # Agregar un salto de página

    # Generamos el PDF a partir del contenido HTML
    generar_pdf(pdf_buffer, html_content)

    # Configuramos la respuesta HTTP con el contenido del PDF
    response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="facturas.pdf"'

    # Mover el archivo PDF a la carpeta deseada
    path = 'C:/Users/Nico/Desktop/Facturas'
    if not os.path.exists(path):
        os.makedirs(path)
    
    # Guardar el PDF principal
    main_pdf_path = os.path.join(path, 'facturas.pdf')
    with open(main_pdf_path, 'wb') as f:
        f.write(pdf_buffer.getvalue())

    # Dividir el PDF y guardar los PDFs individuales
    pdf_buffer.seek(0)  # Reiniciar el puntero del buffer
    dividir_pdf(pdf_buffer, path)

    return response

def generar_pdf(buffer, html_content):
    pisa_status = pisa.CreatePDF(html_content, dest=buffer)
    return pisa_status.err

def dividir_pdf(buffer, output_dir):
    # Obtener todos los clientes únicos de la lista de deudas
    clientes_deuda = ClienteDeuda.objects.filter(pagado=False).values_list('cliente', flat=True).distinct()
    input_pdf = PdfReader(buffer)
    
    # Iterar sobre cada cliente y asignarle una página del PDF
    for i, cliente_id in enumerate(clientes_deuda):
        if i < len(input_pdf.pages):
            page = input_pdf.pages[i]
            cliente = Cliente.objects.get(id=cliente_id)  # Obtener el objeto cliente
            
            output = PdfWriter()
            output.add_page(page)
            
            # Guardar el PDF con el nombre del cliente y el número de página
            with open(os.path.join(output_dir, f'{cliente.apellido}_{cliente.nombre}_{cliente.dni}_factura.pdf'), 'wb') as output_stream:
                output.write(output_stream)



#def enviar_mensajes_whatsapp(request):
