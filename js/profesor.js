let profesores = [];
const API_URL = "../api";

async function cargarProfesores() {
  try {
    const response = await fetch(
      `${API_URL}/profesor.php?withEmpleadoInfo=true`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    profesores = await response.json();

    actualizarTablaProfesores();
  } catch (error) {
    console.error("Error al cargar profesores:", error);
    alert("Error al cargar profesores. Consulte la consola para más detalles.");
  }
}

function actualizarTablaProfesores() {
  const tabla = document.getElementById("tablaProfesores");
  if (!tabla) {
    console.error("Elemento tablaProfesores no encontrado en el DOM");
    return;
  }

  tabla.innerHTML = "";

  if (!Array.isArray(profesores)) {
    console.error("Los datos de profesores no son un array:", profesores);
    return;
  }
  
  const userType = sessionStorage.getItem("userType");
  const esProfesorGuia = userType === "profesor_guia";

  profesores.forEach((profesor) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
            <td>${profesor.ID_empleado}</td>
            <td>${profesor.nombre} ${profesor.apellido}</td>
            <td>${profesor.especialidad}</td>
            <td>${profesor.nivel_academico}</td>
            <td>${profesor.anos_experiencia}</td>
            <td>${profesor.correo || "-"}<br>${profesor.telefono || "-"}</td>
            <td class="action-buttons">
                ${!esProfesorGuia ? 
                `<a href="empleado.html?id=${profesor.ID_empleado}" class="btn btn-sm btn-primary" title="Editar en Empleados">
                    <i class="fas fa-edit"></i>
                </a>` : ''}
            </td>
        `;

    tabla.appendChild(fila);
  });
}

async function consultarProfesores() {
  const opciones = ["Especialidad", "Nivel Académico"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}`
  );

  if (opcion) {
    let url;

    switch (opcion) {
      case "1":
        const especialidad = prompt("Ingrese la especialidad:");
        if (especialidad) {
          url = `${API_URL}/profesor.php?search=true&especialidad=${encodeURIComponent(
            especialidad
          )}`;
        }
        break;

      case "2":
        const nivelAcademico = prompt("Ingrese el nivel académico:");
        if (nivelAcademico) {
          url = `${API_URL}/profesor.php?search=true&nivel_academico=${encodeURIComponent(
            nivelAcademico
          )}`;
        }
        break;

      default:
        alert("Opción no válida");
        return;
    }

    if (url) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();

        if (Array.isArray(result) && result.length > 0) {
          const profesoresDetallados = [];

          for (const profesor of result) {
            const respDetalle = await fetch(
              `${API_URL}/profesor.php?withEmpleadoInfo=${profesor.ID_empleado}`
            );

            if (respDetalle.ok) {
              const detalles = await respDetalle.json();
              if (Array.isArray(detalles) && detalles.length > 0) {
                profesoresDetallados.push(detalles[0]);
              }
            }
          }

          if (profesoresDetallados.length > 0) {
            profesores = profesoresDetallados;
            actualizarTablaProfesores();
          } else {
            alert("No se pudo obtener información detallada de los profesores");
          }
        } else {
          alert("No se encontraron profesores con ese criterio");
          cargarProfesores(); 
        }
      } catch (error) {
        console.error("Error al consultar profesores:", error);
        alert(`Error al consultar profesores: ${error.message}`);
      }
    }
  }
}

function aplicarRestricciones() {
  const userType = sessionStorage.getItem("userType");
  if (userType === "profesor_guia") {
    const crearBtn = document.querySelector('a[href="empleado.html"]');
    if (crearBtn) {
      crearBtn.style.display = "none";
    }

    const infoAlert = document.querySelector('.alert.alert-info');
    if (infoAlert) {
      infoAlert.innerHTML = "<h5 class='alert-heading'><i class='fas fa-info-circle me-2'></i>Información</h5><p>Como profesor guía, solo puede ver la información de los profesores.</p>";
    }
  }
}

function getUrlParams() {
  const params = {};
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }

  return params;
}

function redirigirAEmpleado(id) {
  window.location.href = `empleado.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const userType = sessionStorage.getItem("userType");
  if (!userType) {
    window.location.href = "../login.html";
    return;
  }

  const params = getUrlParams();
  if (params.id) {
    if (userType === "profesor_guia") {
      alert("No tiene permisos para editar profesores");
      window.location.href = "profesor.html";
      return;
    }

    redirigirAEmpleado(params.id);
    return; 
  }

  cargarProfesores();

  aplicarRestricciones();

  const btnConsultar = document.getElementById("btnConsultar");
  if (btnConsultar) {
    btnConsultar.addEventListener("click", consultarProfesores);
  }
});