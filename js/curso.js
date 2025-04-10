// Variables globales
let cursos = [];
let profesores = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Cargar profesores para el select
async function cargarProfesores() {
  try {
    const response = await fetch(
      `${API_URL}/profesor.php?withEmpleadoInfo=true`
    );

    if (!response.ok) {
      // Fallback a datos de prueba si la API no está lista
      console.warn("API de profesores no disponible, usando datos de prueba");
      profesores = [
        {
          ID_empleado: 1,
          nombre: "Juan",
          apellido: "Pérez",
          especialidad: "Matemáticas",
        },
        {
          ID_empleado: 2,
          nombre: "María",
          apellido: "González",
          especialidad: "Literatura",
        },
        {
          ID_empleado: 3,
          nombre: "Carlos",
          apellido: "Ramírez",
          especialidad: "Ciencias",
        },
        {
          ID_empleado: 4,
          nombre: "Laura",
          apellido: "Sánchez",
          especialidad: "Historia",
        },
        {
          ID_empleado: 5,
          nombre: "Roberto",
          apellido: "Díaz",
          especialidad: "Computación",
        },
      ];
    } else {
      profesores = await response.json();
    }

    // Llenar el select de profesores
    const selectProfesor = document.getElementById("profesorGuia");
    selectProfesor.innerHTML =
      '<option value="">Seleccione un profesor</option>';

    profesores.forEach((profesor) => {
      const option = document.createElement("option");
      option.value = profesor.ID_empleado;
      option.textContent = `${profesor.nombre} ${profesor.apellido} - ${
        profesor.especialidad || "Sin especialidad"
      }`;
      selectProfesor.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar profesores:", error);
    alert(
      "Error al cargar la lista de profesores. Consulte la consola para más detalles."
    );
  }
}

// Cargar cursos
async function cargarCursos() {
  try {
    const response = await fetch(`${API_URL}/curso.php?withProfesorGuia=true`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    cursos = await response.json();

    // Actualizar la tabla con los datos
    actualizarTablaCursos();
  } catch (error) {
    console.error("Error al cargar cursos:", error);
    alert("Error al cargar cursos. Consulte la consola para más detalles.");
  }
}

// Mostrar cursos en la tabla
function actualizarTablaCursos() {
  const tabla = document.getElementById("tablaCursos");
  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(cursos)) {
    console.error("Los datos de cursos no son un array:", cursos);
    return;
  }

  cursos.forEach((curso) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${curso.ID_curso}</td>
            <td>${curso.nombre}</td>
            <td>${curso.ano_academico}</td>
            <td>${curso.profesor_nombre} ${curso.profesor_apellido}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="seleccionarCurso(${curso.ID_curso})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${curso.ID_curso})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tabla.appendChild(fila);
  });
}

// Seleccionar curso para editar
function seleccionarCurso(id) {
  const curso = cursos.find((c) => c.ID_curso == id);
  if (curso) {
    document.getElementById("cursoId").value = curso.ID_curso;
    document.getElementById("nombre").value = curso.nombre;
    document.getElementById("anoAcademico").value = curso.ano_academico;
    document.getElementById("profesorGuia").value = curso.ID_profesor_guia;
  }
}

// Guardar nuevo curso
async function guardarCurso() {
  // Obtener datos del formulario
  const curso = {
    nombre: document.getElementById("nombre").value,
    ano_academico: document.getElementById("anoAcademico").value,
    ID_profesor_guia: document.getElementById("profesorGuia").value,
  };

  // Validar datos
  if (!curso.nombre || !curso.ano_academico || !curso.ID_profesor_guia) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/curso.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(curso),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarCursos();
      document.getElementById("cursoForm").reset();

      // Mostrar mensaje de éxito
      alert("Curso guardado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al guardar curso");
    }
  } catch (error) {
    console.error("Error al guardar curso:", error);
    alert(`Error al guardar curso: ${error.message}`);
  }
}

// Modificar curso existente
async function modificarCurso() {
  const id = document.getElementById("cursoId").value;
  if (!id) {
    alert("Por favor, seleccione un curso para modificar");
    return;
  }

  // Obtener datos del formulario
  const curso = {
    nombre: document.getElementById("nombre").value,
    ano_academico: document.getElementById("anoAcademico").value,
    ID_profesor_guia: document.getElementById("profesorGuia").value,
  };

  // Validar datos
  if (!curso.nombre || !curso.ano_academico || !curso.ID_profesor_guia) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/curso.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(curso),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarCursos();
      document.getElementById("cursoForm").reset();
      document.getElementById("cursoId").value = "";

      // Mostrar mensaje de éxito
      alert("Curso modificado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al modificar curso");
    }
  } catch (error) {
    console.error("Error al modificar curso:", error);
    alert(`Error al modificar curso: ${error.message}`);
  }
}

// Eliminar curso
async function eliminarCurso(id) {
  try {
    const response = await fetch(`${API_URL}/curso.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarCursos();
      document.getElementById("cursoForm").reset();
      document.getElementById("cursoId").value = "";

      // Mostrar mensaje de éxito
      alert("Curso eliminado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al eliminar curso");
    }
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    alert(`Error al eliminar curso: ${error.message}`);
  }
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  if (confirm("¿Está seguro de que desea eliminar este curso?")) {
    eliminarCurso(id);
  }
}

// Consultar cursos (filtrar)
async function consultarCursos() {
  const opciones = ["Nombre", "Año Académico", "Profesor Guía"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}\n3. ${opciones[2]}`
  );

  if (opcion) {
    let url;

    switch (opcion) {
      case "1":
        const nombre = prompt("Ingrese el nombre del curso:");
        if (nombre) {
          url = `${API_URL}/curso.php?search=true&nombre=${encodeURIComponent(
            nombre
          )}`;
        }
        break;

      case "2":
        const ano = prompt("Ingrese el año académico:");
        if (ano) {
          url = `${API_URL}/curso.php?ano_academico=${encodeURIComponent(ano)}`;
        }
        break;

      case "3":
        const profesorId = prompt("Ingrese el ID del profesor guía:");
        if (profesorId) {
          url = `${API_URL}/curso.php?profesor_guia=${encodeURIComponent(
            profesorId
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
          cursos = result;
          actualizarTablaCursos();
        } else {
          alert("No se encontraron cursos con ese criterio");
          cargarCursos(); // Volver a mostrar todos
        }
      } catch (error) {
        console.error("Error al consultar cursos:", error);
        alert(`Error al consultar cursos: ${error.message}`);
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
  cargarProfesores();
  cargarCursos();

  // Asociar eventos a botones
  document.getElementById("btnGuardar").addEventListener("click", guardarCurso);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarCurso);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("cursoId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione un curso para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarCursos);
});
