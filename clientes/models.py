from django.db import models
import datetime


# Create your models here.
class Zona(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, default=0.0)  # Puedes ajustar el valor predeterminado según tus necesidades
    longitud = models.DecimalField(max_digits=9, decimal_places=6, default=0.0)

    def __str__(self):
        return self.nombre


class Servicio(models.Model):
    idServicio = models.AutoField(primary_key=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_plan = models.CharField(max_length=45)
    cantidad_megas = models.CharField(max_length=45)

    def __str__(self):
        return (
            "Plan: "
            + self.tipo_plan
            + " - Megas: "
            + self.cantidad_megas
            + " - Monto: $"
            + str(self.monto)
        )

class Deuda(models.Model):
    MES = [
        ['Enero', 'Enero'],
        ['Febrero', 'Febrero'],
        ['Marzo', 'Marzo'],
        ['Abril', 'Abril'],
        ['Mayo', 'Mayo'],
        ['Junio', 'Junio'],
        ['Julio', 'Julio'],
        ['Agosto', 'Agosto'],
        ['Septiembre', 'Septiembre'],
        ['Octubre', 'Octubre'],
        ['Noviembre', 'Noviembre'],
        ['Diciembre', 'Diciembre'],
    ]
    mes_deuda = models.CharField(max_length=20, choices=MES)
    año_deuda = models.IntegerField()
    
    def __str__(self) -> str:
        return ("mes : " + self.mes_deuda +
                " año : " + str(self.año_deuda))

    class Meta:
        unique_together = ('mes_deuda', 'año_deuda')



class Cliente(models.Model):
    dni = models.CharField(max_length=10,unique=True)
    apellido = models.CharField(max_length=100)
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=15)
    ESTADOS = [
        ['A' ,'A'],
        ['B', 'B'],
        ['S', 'S']
    ]
    router = models.CharField(max_length=30, default='Mercusi')
    n_serie = models.BigIntegerField(default= 1234567893)
    estado = models.CharField(max_length=1, default="A",choices=ESTADOS)
    observaciones = models.TextField()
    fecha_alta = models.DateField(default= datetime.date.today )
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE)
    deudas = models.ManyToManyField(Deuda, through='ClienteDeuda')

    def __str__(self):
        return (
            "Nombre: "
            + self.nombre
            + " Apellido: "
            + self.apellido
            + " DNI: "
            + self.dni
        )

class ClienteDeuda(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    deuda = models.ForeignKey(Deuda, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    pagado = models.BooleanField(default=False)
    fecha_pago = models.DateField(null=True)

    def __str__(self) -> str:
        return ("cliente:" + self.cliente.nombre)

