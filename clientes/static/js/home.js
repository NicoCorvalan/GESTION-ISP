// Realizar la petición HTTP para obtener la cantidad total de clientes
fetch("http://127.0.0.1:5000/cardClientes")
    .then(response => response.json())
    .then(data => {
        document.getElementById("clientesTotal").innerText = data[0][0];
    })
    .catch(error => console.error(error));

// Supongamos que tienes una lista de zonas con latitud y longitud
const zonas = [];

function cargar_zonas() {
    fetch("/cargar_zonas/")
        .then(response => response.json())
        .then(data => {
            zonas.push(...data.zonas);
            mostrarZonasEnMapa();
        })
        .catch(error => console.error(error));
}

function mostrarZonasEnMapa() {
    // Inicializa el mapa
    const map = L.map('map').setView([-27.709872, -63.772636], 12);

    // Agrega una capa de mapa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agrega marcadores para cada zona
    zonas.forEach(zona => {
        L.marker([parseFloat(zona.latitud), parseFloat(zona.longitud)])
            .addTo(map)
            .bindPopup(`<b>${zona.nombre}</b><br>Latitud: ${zona.latitud}<br>Longitud: ${zona.longitud}`);
    });
}

// Llama a la función para cargar las zonas al inicio
cargar_zonas();

