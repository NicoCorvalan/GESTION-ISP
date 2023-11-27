from django.urls import path
from clientes import views
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('home/', views.home, name='home'),
    path('clientes/', views.renderizar, name='clientes'),
    path('registro/', views.registrar, name='registro'),
    path('cargar_clientes/',views.cargar_clientes,name='carga_clientes'),
    path('editar/', views.editar,name='editar'),
    path('baja/<int:id>/', views.baja_logica,name='baja_logica' ),
    path('alta/<int:id>/', views.alta, name='alta'),
    path('suspender/<int:id>/', views.suspender_cliente, name='suspender_cliente'),
    path('users/logout/', views.logout_view, name='logout'),
    path('generar_deuda/', views.generar_deuda, name='generar_deuda'),
    path('pagar_deuda/', views.registrar_pago, name='pagar'),
    path('servicios/', views.servicios, name='servicios'),
    path('cargar_servicios/', views.cargar_servicios, name='cargar_servicios'),
    path('eliminar_servicio/<int:servicio_id>/', views.eliminar_servicio, name='eliminar_servicio'),
    path('editar_servicio/<int:servicio_id>/', views.editar_servicio, name='editar_servicio'),
    path('zonas/', views.zonas, name='zonas'),
    path('cargar_zonas/', views.cargar_zonas, name='cargar_zonas'),
    path('editar_zona/', views.editar_zona, name='editar_zona'),
    path('cargar_zona/<int:zona_id>/', views.cargar_zona, name='cargar_zona'),
    path('eliminar_zona/<int:zona_id>/', views.eliminar_zona, name='eliminar_zona'),
]