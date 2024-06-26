# Generated by Django 4.2.7 on 2023-12-19 19:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clientes', '0019_merge_20231116_1938'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=25)),
                ('dni', models.PositiveIntegerField()),
                ('email', models.EmailField(max_length=254)),
                ('problema', models.TextField()),
            ],
        ),
    ]
