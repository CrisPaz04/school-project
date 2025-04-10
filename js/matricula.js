// Variables globales
let matriculas = [];
let estudiantes = [];
let cursos = [];
const URL_API = "../api";

// Funciones para operaciones CRUD

// Cargar estudiantes para el select
function cargarEstudiantes() {
  // En un entorno real, esto sería una llamada fetch a la API
  // Por ahora, vamos a cargar datos de muestra
  estudiantes = [
    { ID_estudiante: 1, nombre: "Ana", apellido: "Martínez" },
    { ID_estudiante: 2, nombre: "Luis", apellido: "García" },
    { ID_estudiante: 3, nombre: "Sofía", apellido: "López" },
    { ID_estudiante: 4, nombre: "Daniel", apellido: "Hernández" },
    { ID_estudiante: 5, nombre: "Carmen", apellido: "Torres" },
  ];

  // Llenar el select de estudiantes
  const selectEstudiante = document.getElementById("estudiante");
  selectEstudiante.innerHTML =
    '<option value="">Seleccione un estudiante</option>';

  estudiantes.forEach((estudiante) => {
    const option = document.createElement("option");
    option.value = estudiante.ID_estudiante;
    option.textContent = `${estudiante.nombre} ${estudiante.apellido}`;
    selectEstudiante.appendChild(option);
  });
}

// Cargar cursos para el select
function cargarCursos() {
  // En un entorno real, esto sería una llamada fetch a la API
  // Por ahora, vamos a cargar datos de muestra
  cursos = [
    { ID_curso: 1, nombre: "Séptimo A", ano_academico: 2024 },
    { ID_curso: 2, nombre: "Octavo A", ano_academico: 2024 },
    { ID_curso: 3, nombre: "Noveno A", ano_academico: 2024 },
    { ID_curso: 4, nombre: "Décimo A", ano_academico: 2024 },
    { ID_curso: 5, nombre: "Undécimo A", ano_academico: 2024 },
  ];

  // Llenar el select de cursos
  const selectCurso = document.getElementById("curso");
  selectCurso.innerHTML = '<option value="">Seleccione un curso</option>';

  cursos.forEach((curso) => {
    const option = document.createElement("option");
    option.value = curso.ID_curso;
    option.textContent = `${curso.nombre} (${curso.ano_academico})`;
    selectCurso.appendChild(option);
  });
}

// Cargar matrículas
function cargarMatriculas() {
  // En un entorno real, esto sería una llamada fetch a la API
  // Por ahora, vamos a cargar datos de muestra
  matriculas = [
    {
      ID_matricula: 1,
      ID_estudiante: 1,
      ID_curso: 1,
      fecha_matricula: "2024-01-15",
      ano_academico: 2024,
      estado: "Activo",
    },
    {
      ID_matricula: 2,
      ID_estudiante: 2,
      ID_curso: 2,
      fecha_matricula: "2024-01-16",
      ano_academico: 2024,
      estado: "Activo",
    },
    {
      ID_matricula: 3,
      ID_estudiante: 3,
      ID_curso: 3,
      fecha_matricula: "2024-01-17",
      ano_academico: 2024,
      estado: "Activo",
    },
    {
      ID_matricula: 4,
      ID_estudiante: 4,
      ID_curso: 4,
      fecha_matricula: "2024-01-18",
      ano_academico: 2024,
      estado: "Activo",
    },
    {
      ID_matricula: 5,
      ID_estudiante: 5,
      ID_curso: 5,
      fecha_matricula: "2024-01-19",
      ano_academico: 2024,
      estado: "Activo",
    },
  ];

  // Actualizar la tabla con los datos
  actualizarTablaMatriculas();
}

// Función auxiliar para obtener el nombre del estudiante
function getNombreEstudiante(id) {
  const estudiante = estudiantes.find((e) => e.ID_estudiante === parseInt(id));
  return estudiante
    ? `${estudiante.nombre} ${estudiante.apellido}`
    : "Desconocido";
}

// Función auxiliar para obtener el nombre del curso
function getNombreCurso(id) {
  const curso = cursos.find((c) => c.ID_curso === parseInt(id));
  return curso ? curso.nombre : "Desconocido";
}

// Mostrar matrículas en la tabla
function actualizarTablaMatriculas() {
  const tabla = document.getElementById("tablaMatriculas");
  tabla.innerHTML = ""; // Limpiar tabla

  matriculas.forEach((matricula) => {
    const fila = document.createElement("tr");

    // Crear celdas con datos
    fila.innerHTML = `
            <td>${matricula.ID_matricula}</td>
            <td>${getNombreEstudiante(matricula.ID_estudiante)}</td>
            <td>${getNombreCurso(matricula.ID_curso)}</td>
            <td>${matricula.fecha_matricula}</td>
            <td>${matricula.ano_academico}</td>
            <td>${matricula.estado}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="seleccionarMatricula(${
                  matricula.ID_matricula
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${
                  matricula.ID_matricula
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tabla.appendChild(fila);
  });
}

// Seleccionar matrícula para editar
function seleccionarMatricula(id) {
  const matricula = matriculas.find((m) => m.ID_matricula === id);
  if (matricula) {
    document.getElementById("matriculaId").value = matricula.ID_matricula;
    document.getElementById("estudiante").value = matricula.ID_estudiante;
    document.getElementById("curso").value = matricula.ID_curso;
    document.getElementById("fechaMatricula").value = matricula.fecha_matricula;
    document.getElementById("anoAcademico").value = matricula.ano_academico;
    document.getElementById("estado").value = matricula.estado;
  }
}

// Guardar nueva matrícula
function guardarMatricula() {
  // Obtener datos del formulario
  const matricula = {
    ID_estudiante: parseInt(document.getElementById("estudiante").value),
    ID_curso: parseInt(document.getElementById("curso").value),
    fecha_matricula: document.getElementById("fechaMatricula").value,
    ano_academico: parseInt(document.getElementById("anoAcademico").value),
    estado: document.getElementById("estado").value,
  };

  // Validar datos
  if (
    !matricula.ID_estudiante ||
    !matricula.ID_curso ||
    !matricula.fecha_matricula
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  // En un entorno real, esto sería una llamada POST a la API
  // Por ahora, simulamos agregar a la lista
  matricula.ID_matricula =
    matriculas.length > 0
      ? Math.max(...matriculas.map((m) => m.ID_matricula)) + 1
      : 1;
  matriculas.push(matricula);

  // Actualizar tabla y limpiar formulario
  actualizarTablaMatriculas();
  document.getElementById("matriculaForm").reset();

  // Mostrar mensaje de éxito
  alert("Matrícula guardada con éxito");
}

// Modificar matrícula existente
function modificarMatricula() {
  const id = parseInt(document.getElementById("matriculaId").value);
  if (!id) {
    alert("Por favor, seleccione una matrícula para modificar");
    return;
  }

  // Obtener datos del formulario
  const matricula = {
    ID_matricula: id,
    ID_estudiante: parseInt(document.getElementById("estudiante").value),
    ID_curso: parseInt(document.getElementById("curso").value),
    fecha_matricula: document.getElementById("fechaMatricula").value,
    ano_academico: parseInt(document.getElementById("anoAcademico").value),
    estado: document.getElementById("estado").value,
  };

  // En un entorno real, esto sería una llamada PUT a la API
  // Por ahora, actualizamos en la lista
  const index = matriculas.findIndex((m) => m.ID_matricula === id);
  if (index !== -1) {
    matriculas[index] = matricula;

    // Actualizar tabla y limpiar formulario
    actualizarTablaMatriculas();
    document.getElementById("matriculaForm").reset();
    document.getElementById("matriculaId").value = "";

    // Mostrar mensaje de éxito
    alert("Matrícula modificada con éxito");
  }
}

// Eliminar matrícula
function eliminarMatricula(id) {
  // En un entorno real, esto sería una llamada DELETE a la API
  // Por ahora, eliminamos de la lista
  matriculas = matriculas.filter((m) => m.ID_matricula !== id);

  // Actualizar tabla y limpiar formulario
  actualizarTablaMatriculas();
  document.getElementById("matriculaForm").reset();
  document.getElementById("matriculaId").value = "";

  // Mostrar mensaje de éxito
  alert("Matrícula eliminada con éxito");
}

// Confirmar antes de eliminar
function confirmarEliminar(id) {
  if (confirm("¿Está seguro de que desea eliminar esta matrícula?")) {
    eliminarMatricula(id);
  }
}

// Consultar matrículas (filtrar por estudiante o curso)
function consultarMatriculas() {
  const opciones = ["Estudiante", "Curso", "Estado"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}\n3. ${opciones[2]}`
  );

  if (opcion) {
    let filtro, criterio;

    switch (opcion) {
      case "1":
        criterio = "Estudiante";
        filtro = prompt("Ingrese el nombre del estudiante:");
        if (filtro) {
          const filtrado = matriculas.filter((m) =>
            getNombreEstudiante(m.ID_estudiante)
              .toLowerCase()
              .includes(filtro.toLowerCase())
          );
          mostrarMatriculasFiltradas(filtrado);
        }
        break;

      case "2":
        criterio = "Curso";
        filtro = prompt("Ingrese el nombre del curso:");
        if (filtro) {
          const filtrado = matriculas.filter((m) =>
            getNombreCurso(m.ID_curso)
              .toLowerCase()
              .includes(filtro.toLowerCase())
          );
          mostrarMatriculasFiltradas(filtrado);
        }
        break;

      case "3":
        criterio = "Estado";
        filtro = prompt("Ingrese el estado (Activo o Inactivo):");
        if (filtro) {
          const filtrado = matriculas.filter((m) =>
            m.estado.toLowerCase().includes(filtro.toLowerCase())
          );
          mostrarMatriculasFiltradas(filtrado);
        }
        break;

      default:
        alert("Opción no válida");
        return;
    }
  }
}

// Mostrar matrículas filtradas
function mostrarMatriculasFiltradas(filtrado) {
  if (filtrado.length > 0) {
    const tabla = document.getElementById("tablaMatriculas");
    tabla.innerHTML = ""; // Limpiar tabla

    filtrado.forEach((matricula) => {
      const fila = document.createElement("tr");

      // Crear celdas con datos
      fila.innerHTML = `
                <td>${matricula.ID_matricula}</td>
                <td>${getNombreEstudiante(matricula.ID_estudiante)}</td>
                <td>${getNombreCurso(matricula.ID_curso)}</td>
                <td>${matricula.fecha_matricula}</td>
                <td>${matricula.ano_academico}</td>
                <td>${matricula.estado}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="seleccionarMatricula(${
                      matricula.ID_matricula
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${
                      matricula.ID_matricula
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

      tabla.appendChild(fila);
    });
  } else {
    alert("No se encontraron matrículas con ese criterio");
    actualizarTablaMatriculas(); // Volver a mostrar todas
  }
}

// Asociar eventos a botones cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("btnGuardar")
    .addEventListener("click", guardarMatricula);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarMatricula);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = parseInt(document.getElementById("matriculaId").value);
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione una matrícula para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarMatriculas);
});
