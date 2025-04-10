// Variables globales
let clases = [];
let cursos = [];
let profesores = [];
let aulas = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Cargar cursos para el select
async function cargarCursos() {
  try {
    const response = await fetch(`${API_URL}/curso.php?withProfesorGuia=true`);

    if (!response.ok) {
      // Fallback a datos de prueba si la API no está lista
      console.warn("API de cursos no disponible, usando datos de prueba");
      cursos = [
        { ID_curso: 1, nombre: "Séptimo A", ano_academico: 2024 },
        { ID_curso: 2, nombre: "Octavo A", ano_academico: 2024 },
        { ID_curso: 3, nombre: "Noveno A", ano_academico: 2024 },
        { ID_curso: 4, nombre: "Décimo A", ano_academico: 2024 },
        { ID_curso: 5, nombre: "Undécimo A", ano_academico: 2024 },
      ];
    } else {
      cursos = await response.json();
    }

    // Llenar el select de cursos
    const selectCurso = document.getElementById("curso");
    selectCurso.innerHTML = '<option value="">Seleccione un curso</option>';

    cursos.forEach((curso) => {
      const option = document.createElement("option");
      option.value = curso.ID_curso;
      option.textContent = `${curso.nombre} (${curso.ano_academico})`;
      selectCurso.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar cursos:", error);
    alert(
      "Error al cargar la lista de cursos. Consulte la consola para más detalles."
    );
  }
}

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
    const selectProfesor = document.getElementById("profesor");
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

// Cargar aulas para el select
async function cargarAulas() {
  try {
    const response = await fetch(`${API_URL}/aula.php?withEdificio=true`);

    if (!response.ok) {
      // Fallback a datos de prueba si la API no está lista
      console.warn("API de aulas no disponible, usando datos de prueba");
      aulas = [
        {
          ID_aula: 1,
          numero: "A101",
          capacidad: 30,
          tipo: "Regular",
          edificio_nombre: "Edificio Principal",
        },
        {
          ID_aula: 2,
          numero: "B201",
          capacidad: 25,
          tipo: "Laboratorio",
          edificio_nombre: "Edificio Ciencias",
        },
        {
          ID_aula: 3,
          numero: "C301",
          capacidad: 20,
          tipo: "Laboratorio Computo",
          edificio_nombre: "Edificio Ciencias",
        },
        {
          ID_aula: 4,
          numero: "D401",
          capacidad: 35,
          tipo: "Regular",
          edificio_nombre: "Edificio Principal",
        },
        {
          ID_aula: 5,
          numero: "E501",
          capacidad: 40,
          tipo: "Auditorio",
          edificio_nombre: "Edificio Artes",
        },
      ];
    } else {
      aulas = await response.json();
    }

    // Llenar el select de aulas
    const selectAula = document.getElementById("aula");
    selectAula.innerHTML = '<option value="">Seleccione un aula</option>';

    aulas.forEach((aula) => {
      const option = document.createElement("option");
      option.value = aula.ID_aula;
      option.textContent = `${aula.numero} - ${aula.tipo} (${
        aula.edificio_nombre || "Sin edificio"
      })`;
      selectAula.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar aulas:", error);
    alert(
      "Error al cargar la lista de aulas. Consulte la consola para más detalles."
    );
  }
}

// Cargar clases
async function cargarClases() {
  try {
    const response = await fetch(`${API_URL}/clase.php?withDetails=true`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    clases = await response.json();

    // Actualizar la tabla con los datos
    actualizarTablaClases();
  } catch (error) {
    console.error("Error al cargar clases:", error);
    alert("Error al cargar clases. Consulte la consola para más detalles.");
  }
}

// Mostrar clases en la tabla
function actualizarTablaClases() {
  const tabla = document.getElementById("tablaClases");
  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(clases)) {
    console.error("Los datos de clases no son un array:", clases);
    return;
  }

  clases.forEach((clase) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${clase.ID_clase}</td>
            <td>${clase.nombre}</td>
            <td>${clase.curso_nombre}</td>
            <td>${clase.profesor_nombre} ${clase.profesor_apellido}</td>
            <td>${clase.aula_numero} (${clase.edificio_nombre})</td>
            <td>${clase.horario}</td>
            <td>${clase.creditos}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary update-class-btn" onclick="seleccionarClase(${clase.ID_clase})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-class-btn" onclick="confirmarEliminar(${clase.ID_clase})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tabla.appendChild(fila);
  });

  // Aplicar restricciones según tipo de usuario
  aplicarRestricciones();
}

// Seleccionar clase para editar
function seleccionarClase(id) {
  const clase = clases.find((c) => c.ID_clase == id);
  if (clase) {
    document.getElementById("claseId").value = clase.ID_clase;
    document.getElementById("nombre").value = clase.nombre;
    document.getElementById("descripcion").value = clase.descripcion || "";
    document.getElementById("curso").value = clase.ID_curso;
    document.getElementById("profesor").value = clase.ID_profesor;
    document.getElementById("aula").value = clase.ID_aula;
    document.getElementById("horario").value = clase.horario;
    document.getElementById("creditos").value = clase.creditos;
  }
}

// Guardar nueva clase
async function guardarClase() {
  // Obtener datos del formulario
  const clase = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    ID_curso: document.getElementById("curso").value,
    ID_profesor: document.getElementById("profesor").value,
    ID_aula: document.getElementById("aula").value,
    horario: document.getElementById("horario").value,
    creditos: document.getElementById("creditos").value,
  };

  // Validar datos
  if (
    !clase.nombre ||
    !clase.ID_curso ||
    !clase.ID_profesor ||
    !clase.ID_aula ||
    !clase.horario ||
    !clase.creditos
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clase.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clase),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarClases();
      document.getElementById("claseForm").reset();

      // Mostrar mensaje de éxito
      alert("Clase guardada con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al guardar clase");
    }
  } catch (error) {
    console.error("Error al guardar clase:", error);
    alert(`Error al guardar clase: ${error.message}`);
  }
}

// Modificar clase existente
async function modificarClase() {
  const id = document.getElementById("claseId").value;
  if (!id) {
    alert("Por favor, seleccione una clase para modificar");
    return;
  }

  // Obtener datos del formulario
  const clase = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    ID_curso: document.getElementById("curso").value,
    ID_profesor: document.getElementById("profesor").value,
    ID_aula: document.getElementById("aula").value,
    horario: document.getElementById("horario").value,
    creditos: document.getElementById("creditos").value,
  };

  // Validar datos
  if (
    !clase.nombre ||
    !clase.ID_curso ||
    !clase.ID_profesor ||
    !clase.ID_aula ||
    !clase.horario ||
    !clase.creditos
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clase.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clase),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarClases();
      document.getElementById("claseForm").reset();
      document.getElementById("claseId").value = "";

      // Mostrar mensaje de éxito
      alert("Clase modificada con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al modificar clase");
    }
  } catch (error) {
    console.error("Error al modificar clase:", error);
    alert(`Error al modificar clase: ${error.message}`);
  }
}

// Eliminar clase
async function eliminarClase(id) {
  try {
    const response = await fetch(`${API_URL}/clase.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarClases();
      document.getElementById("claseForm").reset();
      document.getElementById("claseId").value = "";

      // Mostrar mensaje de éxito
      alert("Clase eliminada con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al eliminar clase");
    }
  } catch (error) {
    console.error("Error al eliminar clase:", error);
    alert(`Error al eliminar clase: ${error.message}`);
  }
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  if (confirm("¿Está seguro de que desea eliminar esta clase?")) {
    eliminarClase(id);
  }
}

// Consultar clases (filtrar)
async function consultarClases() {
  const opciones = ["Nombre", "Curso", "Profesor", "Aula"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}\n3. ${opciones[2]}\n4. ${opciones[3]}`
  );

  if (opcion) {
    let url;

    switch (opcion) {
      case "1":
        const nombre = prompt("Ingrese el nombre de la clase:");
        if (nombre) {
          url = `${API_URL}/clase.php?search=true&nombre=${encodeURIComponent(
            nombre
          )}`;
        }
        break;

      case "2":
        const cursoId = prompt("Ingrese el ID del curso:");
        if (cursoId) {
          url = `${API_URL}/clase.php?curso=${encodeURIComponent(cursoId)}`;
        }
        break;

      case "3":
        const profesorId = prompt("Ingrese el ID del profesor:");
        if (profesorId) {
          url = `${API_URL}/clase.php?profesor=${encodeURIComponent(
            profesorId
          )}`;
        }
        break;

      case "4":
        const aulaId = prompt("Ingrese el ID del aula:");
        if (aulaId) {
          url = `${API_URL}/clase.php?aula=${encodeURIComponent(aulaId)}`;
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
          clases = result;
          actualizarTablaClases();
        } else {
          alert("No se encontraron clases con ese criterio");
          cargarClases(); // Volver a mostrar todas
        }
      } catch (error) {
        console.error("Error al consultar clases:", error);
        alert(`Error al consultar clases: ${error.message}`);
      }
    }
  }
}

// Aplicar restricciones según tipo de usuario
function aplicarRestricciones() {
  const userType = sessionStorage.getItem("userType");
  if (userType === "profesor_guia") {
    // Profesor guía no puede modificar ni eliminar clases
    const updateButtons = document.querySelectorAll(".update-class-btn");
    const deleteButtons = document.querySelectorAll(".delete-class-btn");

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
  cargarCursos();
  cargarProfesores();
  cargarAulas();
  cargarClases();

  // Asociar eventos a botones
  document.getElementById("btnGuardar").addEventListener("click", guardarClase);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarClase);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("claseId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione una clase para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarClases);

  // Aplicar restricciones iniciales
  aplicarRestricciones();
});
