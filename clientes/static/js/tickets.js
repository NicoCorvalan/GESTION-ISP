document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("ticket-form");

  form.addEventListener("submit", function (event) {
    // Evita que el formulario se envíe de forma predeterminada
    event.preventDefault();

    // Realiza la solicitud AJAX para enviar el formulario
    var formData = new FormData(form);
    fetch(form.action, {
      method: form.method,
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Muestra una alerta de SweetAlert en caso de éxito
          Swal.fire({
            icon: "success",
            title: "Perfecto!",
            text: data.success,
          }).then(() => {
            // Recarga la página después de cerrar la alerta
            location.reload();
          });
        } else {
          // Muestra una alerta de SweetAlert en caso de error
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Hubo un problema al enviar el formulario.",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
