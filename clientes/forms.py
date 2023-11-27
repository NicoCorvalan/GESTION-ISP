from django import forms
from .models import Cliente, Deuda, Servicio, Zona

class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = "__all__"
        exclude = ["estado", "deudas"]
        widgets = {"fecha_alta": forms.DateInput(attrs={"type": "date"})}


class LoginForm(forms.Form):
    username = forms.CharField(
        max_length=100,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "Ingrese su usuario",
                "autocomplete": "off",
                "id": "username",
                "name": "username",
            }
        ),
    )
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "placeholder": "Contraseña",
                "autocomplete": "off",
            }
        )
    )


class DeudaForm(forms.ModelForm):
    class Meta:
        model = Deuda
        fields = ["mes_deuda", "año_deuda"]

    def __init__(self, *args, **kwargs):
        super(DeudaForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({"class": "form-control"})

class ServiciosForm(forms.ModelForm):
    class Meta:
        model = Servicio
        fields = ["monto", "tipo_plan", "cantidad_megas"]
        exclude = ["idServicio"]

    def __init__(self, *args, **kwargs):
        super(ServiciosForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({"class": "form-control"})

class ZonasForm(forms.ModelForm):
    class Meta:
        model = Zona
        fields = ['nombre', 'latitud', 'longitud']

    def __init__(self, *args, **kwargs):
        super(ZonasForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({"class": "form-control"})