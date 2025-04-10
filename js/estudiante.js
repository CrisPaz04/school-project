// Variables globales
let estudiantes = [];
const API_URL = "../api";

// Función para verificar si un elemento existe en el DOM
function $(id) {
  return document.getElementById(id);
}

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
  const tabla = $("tablaEstudiantes");
  if (!tabla) {
    console.error("Elemento tablaEstudiantes no encontrado");
    return;
  }

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
  console.log("Seleccionando estudiante con ID:", id);

  const estudiante = estudiantes.find((e) => e.ID_estudiante == id);
  if (!estudiante) return;

  // Guardar ID en campo oculto
  $("estudianteId").value = estudiante.ID_estudiante;

  // Llenar formulario con datos del estudiante
  $("nombre").value = estudiante.nombre;
  $("apellido").value = estudiante.apellido;
  $("fechaNacimiento").value = estudiante.fecha_nacimiento;
  $("direccion").value = estudiante.direccion;
  $("telefono").value = estudiante.telefono || "";
  $("correo").value = estudiante.correo || "";
  $("nombreEncargado").value = estudiante.nombre_encargado;
}

// Guardar estudiante (nuevo o actualización)
async function guardarEstudiante() {
  const id = $("estudianteId") ? $("estudianteId").value : "";
  console.log("ID del estudiante en guardarEstudiante:", id);

  // Obtener datos del formulario
  const estudiante = {
    nombre: $("nombre").value,
    apellido: $("apellido").value,
    fecha_nacimiento: $("fechaNacimiento").value,
    direccion: $("direccion").value,
    telefono: $("telefono").value,
    correo: $("correo").value,
    nombre_encargado: $("nombreEncargado").value,
  };

  // Validar datos
  if (
    !estudiante.nombre ||
    !estudiante.apellido ||
    !estudiante.fecha_nacimiento ||
    !estudiante.direccion ||
    !estudiante.nombre_encargado
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  // Si hay ID, es actualización
  if (id && id !== "") {
    console.log("Ejecutando actualización de estudiante");

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
        limpiarFormulario();

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
  } else {
    console.log("Ejecutando creación de estudiante");

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
        limpiarFormulario();

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
}

// Limpiar formulario
function limpiarFormulario() {
  const form = $("estudianteForm");
  if (form) form.reset();

  const idField = $("estudianteId");
  if (idField) idField.value = "";
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
      limpiarFormulario();

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
async function confirmarEliminar(id) {
  try {
    // Verificar si tiene matrículas
    const responseMatriculas = await fetch(
      `${API_URL}/matricula.php?estudiante=${id}`
    );
    if (responseMatriculas.ok) {
      const matriculas = await responseMatriculas.json();
      if (Array.isArray(matriculas) && matriculas.length > 0) {
        alert(
          "No se puede eliminar este estudiante porque tiene matrículas asignadas. Elimine primero las matrículas."
        );
        return;
      }
    }
  } catch (error) {
    console.error("Error al verificar dependencias:", error);
  }

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
  // Verificar autenticación
  const userType = sessionStorage.getItem("userType");
  if (!userType) {
    window.location.href = "../login.html";
    return;
  }

  // Cargar datos iniciales
  cargarEstudiantes();

  // Asociar eventos a botones
  const btnGuardar = $("btnGuardar");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", guardarEstudiante);
  }

  const btnConsultar = $("btnConsultar");
  if (btnConsultar) {
    btnConsultar.addEventListener("click", consultarEstudiantes);
  }

  // Si existe, quitar evento al botón modificar
  const btnModificar = $("btnModificar");
  if (btnModificar) {
    btnModificar.addEventListener("click", guardarEstudiante);
  }
});
