# Generated by Django 4.2.4 on 2023-11-13 23:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clientes', '0012_alter_servicio_idservicio'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='deuda',
            unique_together={('mes_deuda', 'año_deuda')},
        ),
    ]
