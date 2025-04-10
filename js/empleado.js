// Variables globales
let empleados = [];
let profesores = [];
const API_URL = "../api";

// Función para verificar si un elemento existe en el DOM
function $(id) {
  return document.getElementById(id);
}

// Mostrar/ocultar campos de profesor
function toggleCamposProfesor() {
  const esProfesor = $("esProfesor");
  const datosProfesor = $("datosProfesor");

  if (!esProfesor || !datosProfesor) return;

  if (esProfesor.checked) {
    datosProfesor.style.display = "block";
  } else {
    datosProfesor.style.display = "none";
  }
}

// Cargar empleados
async function cargarEmpleados() {
  try {
    // Cargar empleados
    const responseEmpleados = await fetch(`${API_URL}/empleado.php`);
    if (!responseEmpleados.ok) {
      throw new Error(`Error HTTP: ${responseEmpleados.status}`);
    }
    empleados = await responseEmpleados.json();

    // Cargar profesores
    const responseProfesores = await fetch(`${API_URL}/profesor.php`);
    if (responseProfesores.ok) {
      profesores = await responseProfesores.json();
    } else {
      console.warn("API de profesores no disponible");
      profesores = [];
    }

    // Actualizar la tabla con los datos
    actualizarTablaEmpleados();
  } catch (error) {
    console.error("Error al cargar empleados:", error);
    alert("Error al cargar empleados. Consulte la consola para más detalles.");
  }
}

// Mostrar empleados en la tabla
function actualizarTablaEmpleados() {
  const tabla = $("tablaEmpleados");
  if (!tabla) {
    console.error("Elemento tablaEmpleados no encontrado");
    return;
  }

  tabla.innerHTML = ""; // Limpiar tabla

  if (!Array.isArray(empleados)) {
    console.error("Los datos de empleados no son un array:", empleados);
    return;
  }

  // Crear un mapa de profesores para búsqueda rápida
  const profesoresMap = {};
  profesores.forEach((profesor) => {
    profesoresMap[profesor.ID_empleado] = profesor;
  });

  empleados.forEach((empleado) => {
    const fila = document.createElement("tr");
    // Determinar si es profesor
    const esProfesor = profesoresMap[empleado.ID_empleado] !== undefined;

    // Crear celdas con datos
    fila.innerHTML = `
      <td>${empleado.ID_empleado}</td>
      <td>${empleado.nombre}</td>
      <td>${empleado.apellido}</td>
      <td>${empleado.telefono || ""}</td>
      <td>${empleado.correo || ""}</td>
      <td>${empleado.fecha_contratacion || ""}</td>
      <td>${parseFloat(empleado.salario || 0).toLocaleString("es-HN", {
        style: "currency",
        currency: "HNL",
      })}</td>
      <td>${
        esProfesor
          ? '<span class="badge bg-success">Sí</span>'
          : '<span class="badge bg-secondary">No</span>'
      }</td>
      <td class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="seleccionarEmpleado(${
          empleado.ID_empleado
        })">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${
          empleado.ID_empleado
        })">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

// Seleccionar empleado para editar
function seleccionarEmpleado(id) {
  console.log("Seleccionando empleado con ID:", id);

  const empleado = empleados.find((e) => e.ID_empleado == id);
  if (!empleado) return;

  const idField = $("empleadoId");
  if (idField) idField.value = empleado.ID_empleado;

  const fields = {
    nombre: empleado.nombre,
    apellido: empleado.apellido,
    fechaNacimiento: empleado.fecha_nacimiento,
    fechaContratacion: empleado.fecha_contratacion,
    telefono: empleado.telefono,
    correo: empleado.correo,
    direccion: empleado.direccion,
    salario: empleado.salario,
  };

  // Rellenar los campos del formulario
  for (const [fieldId, value] of Object.entries(fields)) {
    const field = $(fieldId);
    if (field) field.value = value || "";
  }

  // Verificar si es profesor
  const esProfesor = profesores.find((p) => p.ID_empleado == id);
  const esProfesorField = $("esProfesor");
  if (esProfesorField) esProfesorField.checked = esProfesor !== undefined;

  // Mostrar/ocultar campos de profesor
  toggleCamposProfesor();

  if (esProfesor) {
    const profesorFields = {
      especialidad: esProfesor.especialidad,
      nivelAcademico: esProfesor.nivel_academico,
      anosExperiencia: esProfesor.anos_experiencia,
    };

    for (const [fieldId, value] of Object.entries(profesorFields)) {
      const field = $(fieldId);
      if (field) field.value = value || "";
    }
  } else {
    const profesorFields = [
      "especialidad",
      "nivelAcademico",
      "anosExperiencia",
    ];
    profesorFields.forEach((fieldId) => {
      const field = $(fieldId);
      if (field) field.value = "";
    });
  }
}

// Guardar empleado (nuevo o actualización)
async function guardarEmpleado() {
  const idField = $("empleadoId");
  const id = idField ? idField.value : "";

  console.log("ID del empleado a guardar:", id);

  // Si hay ID, es una actualización
  if (id && id !== "") {
    return await modificarEmpleado(id);
  }

  // Si no hay ID, es un nuevo registro
  const empleado = obtenerDatosFormulario();

  // Validar datos
  if (!validarDatosEmpleado(empleado)) {
    return;
  }

  try {
    // Guardar empleado
    const response = await fetch(`${API_URL}/empleado.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error desconocido al guardar empleado");
    }

    // Si es profesor, guardar datos de profesor
    if ($("esProfesor") && $("esProfesor").checked) {
      await guardarProfesor(result.id);
    }

    // Actualizar tabla y limpiar formulario
    await cargarEmpleados();
    limpiarFormulario();

    // Mostrar mensaje de éxito
    alert("Empleado guardado con éxito");
  } catch (error) {
    console.error("Error al guardar empleado:", error);
    alert(`Error al guardar empleado: ${error.message}`);
  }
}

// Guardar datos de profesor
async function guardarProfesor(empleadoId) {
  const profesor = {
    ID_empleado: empleadoId,
    especialidad: $("especialidad") ? $("especialidad").value : "",
    nivel_academico: $("nivelAcademico") ? $("nivelAcademico").value : "",
    anos_experiencia: $("anosExperiencia") ? $("anosExperiencia").value : "",
  };

  // Validar datos de profesor
  if (
    !profesor.especialidad ||
    !profesor.nivel_academico ||
    !profesor.anos_experiencia
  ) {
    alert("Por favor, complete todos los campos de profesor");
    return false;
  }

  const responseProfesor = await fetch(`${API_URL}/profesor.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profesor),
  });

  if (!responseProfesor.ok) {
    const errorData = await responseProfesor.json();
    throw new Error(
      errorData.error || `Error HTTP: ${responseProfesor.status}`
    );
  }

  const resultProfesor = await responseProfesor.json();

  if (!resultProfesor.success) {
    throw new Error(
      resultProfesor.error || "Error desconocido al guardar profesor"
    );
  }

  return true;
}

// Modificar empleado existente
async function modificarEmpleado(id) {
  console.log("Modificando empleado con ID:", id);

  if (!id) {
    alert("Por favor, seleccione un empleado para modificar");
    return;
  }

  const empleado = obtenerDatosFormulario();

  // Validar datos
  if (!validarDatosEmpleado(empleado)) {
    return;
  }

  try {
    console.log("Datos a actualizar:", empleado);

    // Modificar empleado
    const response = await fetch(`${API_URL}/empleado.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log("Resultado de actualización:", result);

    if (!result.success) {
      throw new Error(
        result.error || "Error desconocido al modificar empleado"
      );
    }

    // Verificar si es profesor
    const esProfesor = $("esProfesor") && $("esProfesor").checked;
    const eraProfesor =
      profesores.find((p) => p.ID_empleado == id) !== undefined;

    console.log("¿Es profesor?", esProfesor);
    console.log("¿Era profesor?", eraProfesor);

    if (esProfesor) {
      const profesor = {
        especialidad: $("especialidad") ? $("especialidad").value : "",
        nivel_academico: $("nivelAcademico") ? $("nivelAcademico").value : "",
        anos_experiencia: $("anosExperiencia")
          ? $("anosExperiencia").value
          : "",
      };

      // Validar datos de profesor
      if (
        !profesor.especialidad ||
        !profesor.nivel_academico ||
        !profesor.anos_experiencia
      ) {
        alert("Por favor, complete todos los campos de profesor");
        return;
      }

      if (eraProfesor) {
        console.log("Actualizando datos de profesor");

        // Actualizar profesor existente
        const responseProfesor = await fetch(
          `${API_URL}/profesor.php?id=${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profesor),
          }
        );

        if (!responseProfesor.ok) {
          const errorData = await responseProfesor.json();
          throw new Error(
            errorData.error || `Error HTTP: ${responseProfesor.status}`
          );
        }

        const resultProfesor = await responseProfesor.json();
        console.log("Resultado de actualización profesor:", resultProfesor);

        if (!resultProfesor.success) {
          throw new Error(
            resultProfesor.error || "Error desconocido al actualizar profesor"
          );
        }
      } else {
        console.log("Creando nuevo profesor con ID:", id);

        // Crear nuevo profesor
        profesor.ID_empleado = id;

        const responseProfesor = await fetch(`${API_URL}/profesor.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profesor),
        });

        if (!responseProfesor.ok) {
          const errorData = await responseProfesor.json();
          throw new Error(
            errorData.error || `Error HTTP: ${responseProfesor.status}`
          );
        }

        const resultProfesor = await responseProfesor.json();
        console.log("Resultado creación profesor:", resultProfesor);

        if (!resultProfesor.success) {
          throw new Error(
            resultProfesor.error || "Error desconocido al crear profesor"
          );
        }
      }
    } else if (eraProfesor) {
      console.log("Eliminando registro de profesor con ID:", id);

      // Eliminar profesor si ya no lo es
      const responseProfesor = await fetch(`${API_URL}/profesor.php?id=${id}`, {
        method: "DELETE",
      });

      if (!responseProfesor.ok) {
        const errorData = await responseProfesor.json();
        throw new Error(
          errorData.error || `Error HTTP: ${responseProfesor.status}`
        );
      }

      const resultProfesor = await responseProfesor.json();
      console.log("Resultado eliminación profesor:", resultProfesor);

      if (!resultProfesor.success) {
        throw new Error(
          resultProfesor.error || "Error desconocido al eliminar profesor"
        );
      }
    }

    // Actualizar tabla y limpiar formulario
    await cargarEmpleados();
    limpiarFormulario();

    // Mostrar mensaje de éxito
    alert("Empleado modificado con éxito");
  } catch (error) {
    console.error("Error al modificar empleado:", error);
    alert(`Error al modificar empleado: ${error.message}`);
  }
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
  return {
    nombre: $("nombre") ? $("nombre").value : "",
    apellido: $("apellido") ? $("apellido").value : "",
    fecha_nacimiento: $("fechaNacimiento") ? $("fechaNacimiento").value : "",
    fecha_contratacion: $("fechaContratacion")
      ? $("fechaContratacion").value
      : "",
    telefono: $("telefono") ? $("telefono").value : "",
    correo: $("correo") ? $("correo").value : "",
    direccion: $("direccion") ? $("direccion").value : "",
    salario: $("salario") ? $("salario").value : "",
  };
}

// Validar datos de empleado
function validarDatosEmpleado(empleado) {
  if (
    !empleado.nombre ||
    !empleado.apellido ||
    !empleado.fecha_nacimiento ||
    !empleado.fecha_contratacion ||
    !empleado.telefono ||
    !empleado.correo ||
    !empleado.direccion ||
    !empleado.salario
  ) {
    alert("Por favor, complete todos los campos obligatorios");
    return false;
  }
  return true;
}

// Limpiar formulario
function limpiarFormulario() {
  const form = $("empleadoForm");
  if (form) form.reset();

  const idField = $("empleadoId");
  if (idField) idField.value = "";

  const datosProfesor = $("datosProfesor");
  if (datosProfesor) datosProfesor.style.display = "none";
}

// Eliminar empleado
async function eliminarEmpleado(id) {
  try {
    // Verificar si es profesor
    const esProfesor =
      profesores.find((p) => p.ID_empleado == id) !== undefined;

    if (esProfesor) {
      // Primero eliminar registro de profesor
      const responseProfesor = await fetch(`${API_URL}/profesor.php?id=${id}`, {
        method: "DELETE",
      });

      if (!responseProfesor.ok) {
        const errorData = await responseProfesor.json();
        throw new Error(
          errorData.error || `Error HTTP: ${responseProfesor.status}`
        );
      }

      const resultProfesor = await responseProfesor.json();
      if (!resultProfesor.success) {
        throw new Error(
          resultProfesor.error || "Error desconocido al eliminar profesor"
        );
      }
    }

    // Luego eliminar empleado
    const response = await fetch(`${API_URL}/empleado.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Actualizar tabla y limpiar formulario
      await cargarEmpleados();
      limpiarFormulario();

      // Mostrar mensaje de éxito
      alert("Empleado eliminado con éxito");
    } else {
      throw new Error(result.error || "Error desconocido al eliminar empleado");
    }
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    alert(`Error al eliminar empleado: ${error.message}`);
  }
}

// Confirmar antes de eliminar
async function confirmarEliminar(id) {
  // Verificar si es profesor y tiene clases o cursos asociados
  const esProfesor = profesores.find((p) => p.ID_empleado == id) !== undefined;

  if (esProfesor) {
    try {
      // Verificar si tiene clases
      const responseClases = await fetch(`${API_URL}/clase.php?profesor=${id}`);
      if (responseClases.ok) {
        const clases = await responseClases.json();
        if (Array.isArray(clases) && clases.length > 0) {
          alert(
            "No se puede eliminar este empleado porque es profesor y tiene clases asignadas. Elimine primero las clases."
          );
          return;
        }
      }

      // Verificar si es profesor guía
      const responseCursos = await fetch(
        `${API_URL}/curso.php?profesor_guia=${id}`
      );
      if (responseCursos.ok) {
        const cursos = await responseCursos.json();
        if (Array.isArray(cursos) && cursos.length > 0) {
          alert(
            "No se puede eliminar este empleado porque es profesor guía de uno o más cursos. Asigne otro profesor guía a los cursos primero."
          );
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar dependencias:", error);
    }
  }

  if (confirm("¿Está seguro de que desea eliminar este empleado?")) {
    eliminarEmpleado(id);
  }
}

// Consultar empleados (filtrar)
async function consultarEmpleados() {
  const opciones = ["Nombre", "Apellido", "Solo Profesores"];
  const opcion = prompt(
    `Elija el criterio de búsqueda:\n1. ${opciones[0]}\n2. ${opciones[1]}\n3. ${opciones[2]}`
  );

  if (opcion) {
    let url;

    switch (opcion) {
      case "1":
        const nombre = prompt("Ingrese el nombre del empleado:");
        if (nombre) {
          url = `${API_URL}/empleado.php?search=true&name=${encodeURIComponent(
            nombre
          )}`;
        }
        break;

      case "2":
        const apellido = prompt("Ingrese el apellido del empleado:");
        if (apellido) {
          url = `${API_URL}/empleado.php?search=true&name=${encodeURIComponent(
            apellido
          )}`;
        }
        break;

      case "3":
        url = `${API_URL}/empleado.php?profesores=true`;
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
          empleados = result;
          actualizarTablaEmpleados();
        } else {
          alert("No se encontraron empleados con ese criterio");
          cargarEmpleados(); // Volver a mostrar todos
        }
      } catch (error) {
        console.error("Error al consultar empleados:", error);
        alert(`Error al consultar empleados: ${error.message}`);
      }
    }
  }
}

// Configurar event listeners cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticación
  const userType = sessionStorage.getItem("userType");
  if (!userType) {
    window.location.href = "../login.html";
    return;
  }

  // Verificar permisos - Solo el DBA puede gestionar empleados
  if (userType !== "dba_colegio") {
    alert("No tiene permisos para acceder a esta sección");
    window.location.href = "../index.html";
    return;
  }

  // Configurar evento para mostrar/ocultar campos de profesor
  if ($("esProfesor")) {
    $("esProfesor").addEventListener("change", toggleCamposProfesor);
  }

  // Configurar eventos de botones solo si existen
  if ($("btnGuardar")) {
    $("btnGuardar").addEventListener("click", guardarEmpleado);
  }

  if ($("btnConsultar")) {
    $("btnConsultar").addEventListener("click", consultarEmpleados);
  }

  // Cargar datos iniciales
  cargarEmpleados();
});
