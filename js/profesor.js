// Variables globales
let profesores = [];
let empleados = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Cargar empleados para el select
async function cargarEmpleados() {
  try {
    const response = await fetch(`${API_URL}/empleado.php`);

    if (!response.ok) {
      // Fallback a datos de prueba si la API no está lista
      console.warn("API de empleados no disponible, usando datos de prueba");
      empleados = [
        { ID_empleado: 1, nombre: "Juan", apellido: "Pérez" },
        { ID_empleado: 2, nombre: "María", apellido: "González" },
        { ID_empleado: 3, nombre: "Carlos", apellido: "Ramírez" },
        { ID_empleado: 4, nombre: "Laura", apellido: "Sánchez" },
        { ID_empleado: 5, nombre: "Roberto", apellido: "Díaz" },
      ];
    } else {
      empleados = await response.json();
    }

    // Llenar el select de empleados
    const selectEmpleado = document.getElementById("empleado");
    selectEmpleado.innerHTML =
      '<option value="">Seleccione un empleado</option>';

    empleados.forEach((empleado) => {
      const option = document.createElement("option");
      option.value = empleado.ID_empleado;
      option.textContent = `${empleado.nombre} ${empleado.apellido}`;
      selectEmpleado.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar empleados:", error);
    alert(
      "Error al cargar la lista de empleados. Consulte la consola para más detalles."
    );
  }
}

// Cargar profesores
async function cargarProfesores() {
  try {
    const response = await fetch(
      `${API_URL}/profesor.php?withEmpleadoInfo=true`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    profesores = await response.json();

    // Actualizar la tabla con los datos
    actualizarTablaProfesores();
  } catch (error) {
    console.error("Error al cargar profesores:", error);
    alert("Error al cargar profesores. Consulte la consola para más detalles.");
  }
}

// Mostrar profesores en la tabla
function actualizarTablaProfesores() {
  const tabla = document.getElementById("tablaProfesores");
  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(profesores)) {
    console.error("Los datos de profesores no son un array:", profesores);
    return;
  }

  profesores.forEach((profesor) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${profesor.ID_empleado}</td>
            <td>${profesor.nombre} ${profesor.apellido}</td>
            <td>${profesor.especialidad}</td>
            <td>${profesor.nivel_academico}</td>
            <td>${profesor.anos_experiencia}</td>
            <td>${profesor.correo || "-"}<br>${profesor.telefono || "-"}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary update-teacher-btn" onclick="seleccionarProfesor(${
                  profesor.ID_empleado
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-teacher-btn" onclick="confirmarEliminar(${
                  profesor.ID_empleado
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

// Seleccionar profesor para editar
function seleccionarProfesor(id) {
  const profesor = profesores.find((p) => p.ID_empleado == id);
  if (profesor) {
    document.getElementById("profesorId").value = profesor.ID_empleado;
    document.getElementById("empleado").value = profesor.ID_empleado;
    document.getElementById("especialidad").value = profesor.especialidad;
    document.getElementById("nivelAcademico").value = profesor.nivel_academico;
    document.getElementById("anosExperiencia").value =
      profesor.anos_experiencia;

    // Deshabilitar el selector de empleado ya que es la clave primaria
    document.getElementById("empleado").disabled = true;
  }
}

// Guardar nuevo profesor
async function guardarProfesor() {
  // Obtener datos del formulario
  const profesor = {
    ID_empleado: document.getElementById("empleado").value,
    especialidad: document.getElementById("especialidad").value,
    nivel_academico: document.getElementById("nivelAcademico").value,
    anos_experiencia: document.getElementById("anosExperiencia").value,
  };

  // Validar datos
  if (
    !profesor.ID_empleado ||
    !profesor.especialidad ||
    !profesor.nivel_academico ||
    !profesor.anos_experiencia
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/profesor.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profesor),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarProfesores();
      document.getElementById("profesorForm").reset();
      document.getElementById("empleado").disabled = false;

      // Mostrar mensaje de éxito
      alert("Profesor guardado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al guardar profesor");
    }
  } catch (error) {
    console.error("Error al guardar profesor:", error);
    alert(`Error al guardar profesor: ${error.message}`);
  }
}

// Modificar profesor existente
async function modificarProfesor() {
  const id = document.getElementById("profesorId").value;
  if (!id) {
    alert("Por favor, seleccione un profesor para modificar");
    return;
  }

  // Obtener datos del formulario
  const profesor = {
    especialidad: document.getElementById("especialidad").value,
    nivel_academico: document.getElementById("nivelAcademico").value,
    anos_experiencia: document.getElementById("anosExperiencia").value,
  };

  // Validar datos
  if (
    !profesor.especialidad ||
    !profesor.nivel_academico ||
    !profesor.anos_experiencia
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/profesor.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profesor),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarProfesores();
      document.getElementById("profesorForm").reset();
      document.getElementById("profesorId").value = "";
      document.getElementById("empleado").disabled = false;

      // Mostrar mensaje de éxito
      alert("Profesor modificado con éxito");
    } else {
      throw new Error(
        result.error || "Error desconocido al modificar profesor"
      );
    }
  } catch (error) {
    console.error("Error al modificar profesor:", error);
    alert(`Error al modificar profesor: ${error.message}`);
  }
}

// Eliminar profesor
async function eliminarProfesor(id) {
  try {
    const response = await fetch(`${API_URL}/profesor.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarProfesores();
      document.getElementById("profesorForm").reset();
      document.getElementById("profesorId").value = "";
      document.getElementById("empleado").disabled = false;

      // Mostrar mensaje de éxito
      alert("Profesor eliminado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al eliminar profesor");
    }
  } catch (error) {
    console.error("Error al eliminar profesor:", error);
    alert(`Error al eliminar profesor: ${error.message}`);
  }
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  if (confirm("¿Está seguro de que desea eliminar este profesor?")) {
    eliminarProfesor(id);
  }
}

// Consultar profesores (filtrar)
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
          // Necesitamos información completa de los profesores
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
          cargarProfesores(); // Volver a mostrar todos
        }
      } catch (error) {
        console.error("Error al consultar profesores:", error);
        alert(`Error al consultar profesores: ${error.message}`);
      }
    }
  }
}

// Aplicar restricciones según tipo de usuario
function aplicarRestricciones() {
  const userType = sessionStorage.getItem("userType");
  if (userType === "profesor_guia") {
    // Profesor guía no puede crear, modificar ni eliminar profesores
    const createButtons = document.querySelectorAll(".create-teacher-btn");
    const updateButtons = document.querySelectorAll(".update-teacher-btn");
    const deleteButtons = document.querySelectorAll(".delete-teacher-btn");

    createButtons.forEach((btn) => (btn.style.display = "none"));
    updateButtons.forEach((btn) => (btn.style.display = "none"));
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
  cargarEmpleados();
  cargarProfesores();

  // Asociar eventos a botones
  document
    .getElementById("btnGuardar")
    .addEventListener("click", guardarProfesor);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarProfesor);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("profesorId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione un profesor para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarProfesores);

  // Aplicar restricciones iniciales
  aplicarRestricciones();
});
