# Generated by Django 4.2.4 on 2023-10-27 23:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clientes', '0004_remove_deuda_monto'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cliente',
            name='idServicio',
        ),
        migrations.AddField(
            model_name='cliente',
            name='servicio',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='clientes.servicio'),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name='deuda',
            name='cliente',
        ),
        migrations.AddField(
            model_name='deuda',
            name='cliente',
            field=models.ForeignKey(default=4, on_delete=django.db.models.deletion.CASCADE, to='clientes.cliente'),
            preserve_default=False,
        ),
    ]