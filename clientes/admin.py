from django.contrib import admin
from .models import Cliente,Zona,Servicio,Deuda,ClienteDeuda
# Register your models here.
admin.site.register(Cliente)
admin.site.register(Servicio)
admin.site.register(Zona)
admin.site.register(Deuda)
admin.site.register(ClienteDeuda)