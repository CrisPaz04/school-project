// Variables globales
let aulas = [];
let edificios = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Cargar edificios para el select
async function cargarEdificios() {
  try {
    const response = await fetch(`${API_URL}/edificio.php`);

    if (!response.ok) {
      // Fallback a datos de prueba si la API no está lista
      console.warn("API de edificios no disponible, usando datos de prueba");
      edificios = [
        {
          ID_edificio: 1,
          nombre: "Edificio Principal",
          ubicacion: "Entrada Norte",
          num_pisos: 3,
        },
        {
          ID_edificio: 2,
          nombre: "Edificio Ciencias",
          ubicacion: "Sector Este",
          num_pisos: 2,
        },
        {
          ID_edificio: 3,
          nombre: "Edificio Artes",
          ubicacion: "Sector Oeste",
          num_pisos: 2,
        },
        {
          ID_edificio: 4,
          nombre: "Edificio Deportes",
          ubicacion: "Sector Sur",
          num_pisos: 1,
        },
        {
          ID_edificio: 5,
          nombre: "Biblioteca Central",
          ubicacion: "Centro del Campus",
          num_pisos: 2,
        },
      ];
    } else {
      edificios = await response.json();
    }

    // Llenar el select de edificios
    const selectEdificio = document.getElementById("edificio");
    selectEdificio.innerHTML =
      '<option value="">Seleccione un edificio</option>';

    edificios.forEach((edificio) => {
      const option = document.createElement("option");
      option.value = edificio.ID_edificio;
      option.textContent = `${edificio.nombre} (${edificio.ubicacion})`;
      selectEdificio.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar edificios:", error);
    alert(
      "Error al cargar la lista de edificios. Consulte la consola para más detalles."
    );
  }
}

// Cargar aulas
async function cargarAulas() {
  try {
    const response = await fetch(`${API_URL}/aula.php?withEdificio=true`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    aulas = await response.json();

    // Actualizar la tabla con los datos
    actualizarTablaAulas();
  } catch (error) {
    console.error("Error al cargar aulas:", error);
    alert("Error al cargar aulas. Consulte la consola para más detalles.");
  }
}

// Mostrar aulas en la tabla
function actualizarTablaAulas() {
  const tabla = document.getElementById("tablaAulas");
  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(aulas)) {
    console.error("Los datos de aulas no son un array:", aulas);
    return;
  }

  aulas.forEach((aula) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${aula.ID_aula}</td>
            <td>${aula.numero}</td>
            <td>${aula.tipo}</td>
            <td>${aula.capacidad}</td>
            <td>${aula.edificio_nombre}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="seleccionarAula(${aula.ID_aula})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${aula.ID_aula})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tabla.appendChild(fila);
  });
}

// Seleccionar aula para editar
function seleccionarAula(id) {
  const aula = aulas.find((a) => a.ID_aula == id);
  if (aula) {
    document.getElementById("aulaId").value = aula.ID_aula;
    document.getElementById("numero").value = aula.numero;
    document.getElementById("capacidad").value = aula.capacidad;
    document.getElementById("tipo").value = aula.tipo;
    document.getElementById("edificio").value = aula.ID_edificio;
  }
}

// Guardar nueva aula
async function guardarAula() {
  // Obtener datos del formulario
  const aula = {
    numero: document.getElementById("numero").value,
    capacidad: document.getElementById("capacidad").value,
    tipo: document.getElementById("tipo").value,
    ID_edificio: document.getElementById("edificio").value,
  };

  // Validar datos
  if (!aula.numero || !aula.capacidad || !aula.tipo || !aula.ID_edificio) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/aula.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aula),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarAulas();
      document.getElementById("aulaForm").reset();

      // Mostrar mensaje de éxito
      alert("Aula guardada con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al guardar aula");
    }
  } catch (error) {
    console.error("Error al guardar aula:", error);
    alert(`Error al guardar aula: ${error.message}`);
  }
}

// Modificar aula existente
async function modificarAula() {
  const id = document.getElementById("aulaId").value;
  if (!id) {
    alert("Por favor, seleccione un aula para modificar");
    return;
  }

  // Obtener datos del formulario
  const aula = {
    numero: document.getElementById("numero").value,
    capacidad: document.getElementById("capacidad").value,
    tipo: document.getElementById("tipo").value,
    ID_edificio: document.getElementById("edificio").value,
  };

  // Validar datos
  if (!aula.numero || !aula.capacidad || !aula.tipo || !aula.ID_edificio) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/aula.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aula),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarAulas();
      document.getElementById("aulaForm").reset();
      document.getElementById("aulaId").value = "";

      // Mostrar mensaje de éxito
      alert("Aula modificada con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al modificar aula");
    }
  } catch (error) {
    console.error("Error al modificar aula:", error);
    alert(`Error al modificar aula: ${error.message}`);
  }
}

// Eliminar aula
async function eliminarAula(id) {
  try {
    const response = await fetch(`${API_URL}/aula.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarAulas();
      document.getElementById("aulaForm").reset();
      document.getElementById("aulaId").value = "";

      // Mostrar mensaje de éxito
      alert("Aula eliminada con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al eliminar aula");
    }
  } catch (error) {
    console.error("Error al eliminar aula:", error);
    alert(`Error al eliminar aula: ${error.message}`);
  }
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  if (confirm("¿Está seguro de que desea eliminar esta aula?")) {
    eliminarAula(id);
  }
}

// Consultar aulas (filtrar)
async function consultarAulas() {
  const opciones = ["Número", "Tipo", "Capacidad mínima", "Edificio"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}\n3. ${opciones[2]}\n4. ${opciones[3]}`
  );

  if (opcion) {
    let url;

    switch (opcion) {
      case "1":
        const numero = prompt("Ingrese el número del aula:");
        if (numero) {
          url = `${API_URL}/aula.php?search=true&numero=${encodeURIComponent(
            numero
          )}`;
        }
        break;

      case "2":
        const tipo = prompt("Ingrese el tipo de aula:");
        if (tipo) {
          url = `${API_URL}/aula.php?tipo=${encodeURIComponent(tipo)}`;
        }
        break;

      case "3":
        const capacidad = prompt("Ingrese la capacidad mínima:");
        if (capacidad && !isNaN(capacidad)) {
          url = `${API_URL}/aula.php?capacidad_minima=${encodeURIComponent(
            capacidad
          )}`;
        }
        break;

      case "4":
        const edificioId = prompt("Ingrese el ID del edificio:");
        if (edificioId) {
          url = `${API_URL}/aula.php?edificio=${encodeURIComponent(
            edificioId
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
          aulas = result;
          actualizarTablaAulas();
        } else {
          alert("No se encontraron aulas con ese criterio");
          cargarAulas(); // Volver a mostrar todas
        }
      } catch (error) {
        console.error("Error al consultar aulas:", error);
        alert(`Error al consultar aulas: ${error.message}`);
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

  // Cargar datos iniciales
  cargarEdificios();
  cargarAulas();

  // Asociar eventos a botones
  document.getElementById("btnGuardar").addEventListener("click", guardarAula);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarAula);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("aulaId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione un aula para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarAulas);
});
