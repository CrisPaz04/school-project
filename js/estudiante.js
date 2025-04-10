// Variables globales
let estudiantes = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Cargar estudiantes
async function cargarEstudiantes() {
  try {
    const response = await fetch(`${API_URL}/estudiante.php`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    estudiantes = await response.json();

    // Actualizar la tabla con los datos
    actualizarTablaEstudiantes();
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
    alert(
      "Error al cargar estudiantes. Consulte la consola para más detalles."
    );
  }
}

// Mostrar estudiantes en la tabla
function actualizarTablaEstudiantes() {
  const tabla = document.getElementById("tablaEstudiantes");
  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(estudiantes)) {
    console.error("Los datos de estudiantes no son un array:", estudiantes);
    return;
  }

  estudiantes.forEach((estudiante) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${estudiante.ID_estudiante}</td>
            <td>${estudiante.nombre}</td>
            <td>${estudiante.apellido}</td>
            <td>${estudiante.fecha_nacimiento}</td>
            <td>${estudiante.telefono || "-"}</td>
            <td>${estudiante.correo || "-"}</td>
            <td>${estudiante.nombre_encargado}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="seleccionarEstudiante(${
                  estudiante.ID_estudiante
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-student-btn" onclick="confirmarEliminar(${
                  estudiante.ID_estudiante
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tabla.appendChild(fila);
  });

  // Aplicar restricciones según tipo de usuario
  aplicarRestricciones();
}

// Seleccionar estudiante para editar
function seleccionarEstudiante(id) {
  const estudiante = estudiantes.find((e) => e.ID_estudiante == id);
  if (estudiante) {
    document.getElementById("estudianteId").value = estudiante.ID_estudiante;
    document.getElementById("nombre").value = estudiante.nombre;
    document.getElementById("apellido").value = estudiante.apellido;
    document.getElementById("fechaNacimiento").value =
      estudiante.fecha_nacimiento;
    document.getElementById("direccion").value = estudiante.direccion;
    document.getElementById("telefono").value = estudiante.telefono || "";
    document.getElementById("correo").value = estudiante.correo || "";
    document.getElementById("nombreEncargado").value =
      estudiante.nombre_encargado;
  }
}

// Guardar nuevo estudiante
async function guardarEstudiante() {
  // Obtener datos del formulario
  const estudiante = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    fecha_nacimiento: document.getElementById("fechaNacimiento").value,
    direccion: document.getElementById("direccion").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    nombre_encargado: document.getElementById("nombreEncargado").value,
  };

  try {
    const response = await fetch(`${API_URL}/estudiante.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(estudiante),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEstudiantes();
      document.getElementById("estudianteForm").reset();

      // Mostrar mensaje de éxito
      alert("Estudiante guardado con éxito");
    } else {
      throw new Error(
        result.error || "Error desconocido al guardar estudiante"
      );
    }
  } catch (error) {
    console.error("Error al guardar estudiante:", error);
    alert(`Error al guardar estudiante: ${error.message}`);
  }
}

// Modificar estudiante existente
async function modificarEstudiante() {
  const id = document.getElementById("estudianteId").value;
  if (!id) {
    alert("Por favor, seleccione un estudiante para modificar");
    return;
  }

  // Obtener datos del formulario
  const estudiante = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    fecha_nacimiento: document.getElementById("fechaNacimiento").value,
    direccion: document.getElementById("direccion").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    nombre_encargado: document.getElementById("nombreEncargado").value,
  };

  try {
    const response = await fetch(`${API_URL}/estudiante.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(estudiante),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEstudiantes();
      document.getElementById("estudianteForm").reset();
      document.getElementById("estudianteId").value = "";

      // Mostrar mensaje de éxito
      alert("Estudiante modificado con éxito");
    } else {
      throw new Error(
        result.error || "Error desconocido al modificar estudiante"
      );
    }
  } catch (error) {
    console.error("Error al modificar estudiante:", error);
    alert(`Error al modificar estudiante: ${error.message}`);
  }
}

// Eliminar estudiante
async function eliminarEstudiante(id) {
  try {
    const response = await fetch(`${API_URL}/estudiante.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEstudiantes();
      document.getElementById("estudianteForm").reset();
      document.getElementById("estudianteId").value = "";

      // Mostrar mensaje de éxito
      alert("Estudiante eliminado con éxito");
    } else {
      throw new Error(
        result.error || "Error desconocido al eliminar estudiante"
      );
    }
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    alert(`Error al eliminar estudiante: ${error.message}`);
  }
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  if (confirm("¿Está seguro de que desea eliminar este estudiante?")) {
    eliminarEstudiante(id);
  }
}

// Consultar estudiantes (filtrar)
async function consultarEstudiantes() {
  const busqueda = prompt(
    "Ingrese el nombre o apellido del estudiante a buscar:"
  );
  if (busqueda) {
    try {
      const response = await fetch(
        `${API_URL}/estudiante.php?search=true&nombre=${encodeURIComponent(
          busqueda
        )}&apellido=${encodeURIComponent(busqueda)}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const filtrado = await response.json();

      if (Array.isArray(filtrado) && filtrado.length > 0) {
        estudiantes = filtrado;
        actualizarTablaEstudiantes();
      } else {
        alert("No se encontraron estudiantes con ese criterio");
        cargarEstudiantes(); // Volver a mostrar todos
      }
    } catch (error) {
      console.error("Error al consultar estudiantes:", error);
      alert(`Error al consultar estudiantes: ${error.message}`);
    }
  }
}

// Aplicar restricciones según tipo de usuario
function aplicarRestricciones() {
  const userType = sessionStorage.getItem("userType");
  if (userType === "profesor_guia") {
    // Profesor guía no puede eliminar estudiantes
    const deleteButtons = document.querySelectorAll(".delete-student-btn");
    deleteButtons.forEach((btn) => (btn.style.display = "none"));
  }
}

// Asociar eventos a botones cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("btnGuardar")
    .addEventListener("click", guardarEstudiante);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarEstudiante);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("estudianteId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione un estudiante para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarEstudiantes);
});
