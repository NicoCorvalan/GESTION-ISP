# Generated by Django 4.2.4 on 2023-10-30 01:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clientes', '0006_remove_deuda_fecha_pago_remove_deuda_monto_pagado_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='clientedeuda',
            old_name='cliente',
            new_name='clientes',
        ),
    ]
