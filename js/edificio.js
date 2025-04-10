// Variables globales
let edificios = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Cargar edificios
async function cargarEdificios() {
  try {
    const response = await fetch(`${API_URL}/edificio.php?withAulas=true`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    edificios = await response.json();

    // Actualizar la tabla con los datos
    actualizarTablaEdificios();
  } catch (error) {
    console.error("Error al cargar edificios:", error);
    alert("Error al cargar edificios. Consulte la consola para más detalles.");
  }
}

// Mostrar edificios en la tabla
function actualizarTablaEdificios() {
  const tabla = document.getElementById("tablaEdificios");
  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(edificios)) {
    console.error("Los datos de edificios no son un array:", edificios);
    return;
  }

  edificios.forEach((edificio) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${edificio.ID_edificio}</td>
            <td>${edificio.nombre}</td>
            <td>${edificio.ubicacion}</td>
            <td>${edificio.num_pisos}</td>
            <td>${edificio.num_aulas || 0}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="seleccionarEdificio(${
                  edificio.ID_edificio
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${
                  edificio.ID_edificio
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tabla.appendChild(fila);
  });
}

// Seleccionar edificio para editar
function seleccionarEdificio(id) {
  const edificio = edificios.find((e) => e.ID_edificio == id);
  if (edificio) {
    document.getElementById("edificioId").value = edificio.ID_edificio;
    document.getElementById("nombre").value = edificio.nombre;
    document.getElementById("ubicacion").value = edificio.ubicacion;
    document.getElementById("numPisos").value = edificio.num_pisos;
  }
}

// Guardar nuevo edificio
async function guardarEdificio() {
  // Obtener datos del formulario
  const edificio = {
    nombre: document.getElementById("nombre").value,
    ubicacion: document.getElementById("ubicacion").value,
    num_pisos: document.getElementById("numPisos").value,
  };

  // Validar datos
  if (!edificio.nombre || !edificio.ubicacion || !edificio.num_pisos) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/edificio.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(edificio),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEdificios();
      document.getElementById("edificioForm").reset();

      // Mostrar mensaje de éxito
      alert("Edificio guardado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al guardar edificio");
    }
  } catch (error) {
    console.error("Error al guardar edificio:", error);
    alert(`Error al guardar edificio: ${error.message}`);
  }
}

// Modificar edificio existente
async function modificarEdificio() {
  const id = document.getElementById("edificioId").value;
  if (!id) {
    alert("Por favor, seleccione un edificio para modificar");
    return;
  }

  // Obtener datos del formulario
  const edificio = {
    nombre: document.getElementById("nombre").value,
    ubicacion: document.getElementById("ubicacion").value,
    num_pisos: document.getElementById("numPisos").value,
  };

  // Validar datos
  if (!edificio.nombre || !edificio.ubicacion || !edificio.num_pisos) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/edificio.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(edificio),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEdificios();
      document.getElementById("edificioForm").reset();
      document.getElementById("edificioId").value = "";

      // Mostrar mensaje de éxito
      alert("Edificio modificado con éxito");
    } else {
      throw new Error(
        result.error || "Error desconocido al modificar edificio"
      );
    }
  } catch (error) {
    console.error("Error al modificar edificio:", error);
    alert(`Error al modificar edificio: ${error.message}`);
  }
}

// Eliminar edificio
async function eliminarEdificio(id) {
  try {
    const response = await fetch(`${API_URL}/edificio.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEdificios();
      document.getElementById("edificioForm").reset();
      document.getElementById("edificioId").value = "";

      // Mostrar mensaje de éxito
      alert("Edificio eliminado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al eliminar edificio");
    }
  } catch (error) {
    console.error("Error al eliminar edificio:", error);
    alert(`Error al eliminar edificio: ${error.message}`);
  }
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  // Verificar si el edificio tiene aulas asociadas
  const edificio = edificios.find((e) => e.ID_edificio == id);
  if (edificio && edificio.num_aulas > 0) {
    alert(
      "No se puede eliminar este edificio porque tiene aulas asociadas. Elimine primero las aulas."
    );
    return;
  }

  if (confirm("¿Está seguro de que desea eliminar este edificio?")) {
    eliminarEdificio(id);
  }
}

// Consultar edificios (filtrar)
async function consultarEdificios() {
  const opciones = ["Nombre", "Ubicación"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}`
  );

  if (opcion) {
    let url;

    switch (opcion) {
      case "1":
        const nombre = prompt("Ingrese el nombre del edificio:");
        if (nombre) {
          url = `${API_URL}/edificio.php?search=true&nombre=${encodeURIComponent(
            nombre
          )}`;
        }
        break;

      case "2":
        const ubicacion = prompt("Ingrese la ubicación:");
        if (ubicacion) {
          url = `${API_URL}/edificio.php?search=true&ubicacion=${encodeURIComponent(
            ubicacion
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
          // Necesitamos información adicional
          const withAulasResponse = await fetch(
            `${API_URL}/edificio.php?withAulas=true`
          );
          if (withAulasResponse.ok) {
            const allEdificios = await withAulasResponse.json();
            const resultIds = result.map((r) => r.ID_edificio);
            edificios = allEdificios.filter((e) =>
              resultIds.includes(e.ID_edificio)
            );
            actualizarTablaEdificios();
          } else {
            edificios = result;
            actualizarTablaEdificios();
          }
        } else {
          alert("No se encontraron edificios con ese criterio");
          cargarEdificios(); // Volver a mostrar todos
        }
      } catch (error) {
        console.error("Error al consultar edificios:", error);
        alert(`Error al consultar edificios: ${error.message}`);
      }
    }
  }
}

// Asociar eventos a botones cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticación
  const userType = sessionStorage.getItem("userType");
  if (!userType) {
    window.location.href = "../login.html";
    return;
  }

  // Verificar permisos - Solo el DBA puede gestionar edificios
  if (userType !== "dba_colegio") {
    alert("No tiene permisos para acceder a esta sección");
    window.location.href = "../index.html";
    return;
  }

  // Cargar datos iniciales
  cargarEdificios();

  // Asociar eventos a botones
  document
    .getElementById("btnGuardar")
    .addEventListener("click", guardarEdificio);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarEdificio);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("edificioId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione un edificio para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarEdificios);
});
