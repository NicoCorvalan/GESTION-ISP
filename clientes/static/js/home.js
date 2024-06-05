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

cargar_zonas();

