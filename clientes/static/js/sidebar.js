const body = document.body,
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    themeActual = localStorage.getItem('theme'),
    switchControl = document.getElementById("modeSwitch"),
    moonIcon = document.querySelector('.bx-moon'),
    sunIcon = document.querySelector('.bx-sun'),
    modeText = body.querySelector(".mode-text"),
    sidebarState = localStorage.getItem('sidebarState');

if (sidebarState === 'closed') {
    sidebar.classList.add('close');
}

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");

    const newSidebarState = sidebar.classList.contains('close') ? 'closed' : 'open';
    localStorage.setItem('sidebarState', newSidebarState);
});

searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
});

switchControl.addEventListener("change", () => {
    if (switchControl.checked) {
        body.classList.add("dark");
        localStorage.setItem("theme", "oscuro");
    } else {
        body.classList.remove("dark");
        localStorage.removeItem("theme");
    }
});

if (themeActual === "oscuro") {
    body.classList.add("dark");
    switchControl.checked = true;
}

function cambiarIconosSegunTema(tema) {
    if (tema === "oscuro") {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
}

switchControl.addEventListener("change", () => {
    if (switchControl.checked) {
        body.classList.add("dark");
        localStorage.setItem("theme", "oscuro");
        cambiarIconosSegunTema("oscuro");
        modeText.innerText = "Light Mode";
    } else {
        body.classList.add("light");
        localStorage.setItem("theme", "claro");
        cambiarIconosSegunTema("claro");
        modeText.innerText = "Dark Mode";
    }
});

if (themeActual === "oscuro") {
    body.classList.add("dark");
    switchControl.checked = true;
    cambiarIconosSegunTema("oscuro");
    modeText.innerText = "Light Mode";
} else {
    body.classList.remove("dark");
    switchControl.checked = false;
    cambiarIconosSegunTema("claro");
    modeText.innerText = "Dark Mode";
}