// Variables globales
let empleados = [];
let profesores = [];
const API_URL = "../api";

// Funciones para operaciones CRUD

// Mostrar/ocultar campos de profesor
function toggleCamposProfesor() {
  const esProfesor = document.getElementById("esProfesor").checked;
  const datosProfesor = document.getElementById("datosProfesor");

  if (esProfesor) {
    datosProfesor.style.display = "block";
    document.getElementById("especialidad").setAttribute("required", "");
    document.getElementById("nivelAcademico").setAttribute("required", "");
    document.getElementById("anosExperiencia").setAttribute("required", "");
  } else {
    datosProfesor.style.display = "none";
    document.getElementById("especialidad").removeAttribute("required");
    document.getElementById("nivelAcademico").removeAttribute("required");
    document.getElementById("anosExperiencia").removeAttribute("required");
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
  const tabla = document.getElementById("tablaEmpleados");
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
            <td>${empleado.telefono}</td>
            <td>${empleado.correo}</td>
            <td>${empleado.fecha_contratacion}</td>
            <td>${parseFloat(empleado.salario).toLocaleString("es-HN", {
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
async function seleccionarEmpleado(id) {
  const empleado = empleados.find((e) => e.ID_empleado == id);
  if (empleado) {
    document.getElementById("empleadoId").value = empleado.ID_empleado;
    document.getElementById("nombre").value = empleado.nombre;
    document.getElementById("apellido").value = empleado.apellido;
    document.getElementById("fechaNacimiento").value =
      empleado.fecha_nacimiento;
    document.getElementById("fechaContratacion").value =
      empleado.fecha_contratacion;
    document.getElementById("telefono").value = empleado.telefono;
    document.getElementById("correo").value = empleado.correo;
    document.getElementById("direccion").value = empleado.direccion;
    document.getElementById("salario").value = empleado.salario;

    // Verificar si es profesor
    const esProfesor = profesores.find((p) => p.ID_empleado == id);
    document.getElementById("esProfesor").checked = esProfesor !== undefined;
    toggleCamposProfesor();

    if (esProfesor) {
      document.getElementById("especialidad").value = esProfesor.especialidad;
      document.getElementById("nivelAcademico").value =
        esProfesor.nivel_academico;
      document.getElementById("anosExperiencia").value =
        esProfesor.anos_experiencia;
    } else {
      document.getElementById("especialidad").value = "";
      document.getElementById("nivelAcademico").value = "";
      document.getElementById("anosExperiencia").value = "";
    }
  }
}

// Guardar nuevo empleado
async function guardarEmpleado() {
  // Obtener datos del formulario
  const empleado = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    fecha_nacimiento: document.getElementById("fechaNacimiento").value,
    fecha_contratacion: document.getElementById("fechaContratacion").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    direccion: document.getElementById("direccion").value,
    salario: document.getElementById("salario").value,
  };

  // Validar datos
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

    const nuevoEmpleadoId = result.id;

    // Si es profesor, guardar datos de profesor
    const esProfesor = document.getElementById("esProfesor").checked;
    if (esProfesor) {
      const profesor = {
        ID_empleado: nuevoEmpleadoId,
        especialidad: document.getElementById("especialidad").value,
        nivel_academico: document.getElementById("nivelAcademico").value,
        anos_experiencia: document.getElementById("anosExperiencia").value,
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
    }

    // Actualizar tabla y limpiar formulario
    await cargarEmpleados();
    document.getElementById("empleadoForm").reset();
    document.getElementById("datosProfesor").style.display = "none";

    // Mostrar mensaje de éxito
    alert("Empleado guardado con éxito");
  } catch (error) {
    console.error("Error al guardar empleado:", error);
    alert(`Error al guardar empleado: ${error.message}`);
  }
}

// Modificar empleado existente
async function modificarEmpleado() {
  const id = document.getElementById("empleadoId").value;
  if (!id) {
    alert("Por favor, seleccione un empleado para modificar");
    return;
  }

  // Obtener datos del formulario
  const empleado = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    fecha_nacimiento: document.getElementById("fechaNacimiento").value,
    fecha_contratacion: document.getElementById("fechaContratacion").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    direccion: document.getElementById("direccion").value,
    salario: document.getElementById("salario").value,
  };

  // Validar datos
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
    return;
  }

  try {
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

    if (!result.success) {
      throw new Error(
        result.error || "Error desconocido al modificar empleado"
      );
    }

    // Verificar si es profesor
    const esProfesor = document.getElementById("esProfesor").checked;
    const eraProfesor =
      profesores.find((p) => p.ID_empleado == id) !== undefined;

    if (esProfesor) {
      const profesor = {
        especialidad: document.getElementById("especialidad").value,
        nivel_academico: document.getElementById("nivelAcademico").value,
        anos_experiencia: document.getElementById("anosExperiencia").value,
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

        if (!resultProfesor.success) {
          throw new Error(
            resultProfesor.error || "Error desconocido al actualizar profesor"
          );
        }
      } else {
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

        if (!resultProfesor.success) {
          throw new Error(
            resultProfesor.error || "Error desconocido al crear profesor"
          );
        }
      }
    } else if (eraProfesor) {
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

      if (!resultProfesor.success) {
        throw new Error(
          resultProfesor.error || "Error desconocido al eliminar profesor"
        );
      }
    }

    // Actualizar tabla y limpiar formulario
    await cargarEmpleados();
    document.getElementById("empleadoForm").reset();
    document.getElementById("empleadoId").value = "";
    document.getElementById("datosProfesor").style.display = "none";

    // Mostrar mensaje de éxito
    alert("Empleado modificado con éxito");
  } catch (error) {
    console.error("Error al modificar empleado:", error);
    alert(`Error al modificar empleado: ${error.message}`);
  }
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
      document.getElementById("empleadoForm").reset();
      document.getElementById("empleadoId").value = "";
      document.getElementById("datosProfesor").style.display = "none";

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

// Asociar eventos a botones cuando el DOM esté cargado
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

  // Evento para mostrar/ocultar campos de profesor
  document
    .getElementById("esProfesor")
    .addEventListener("change", toggleCamposProfesor);

  // Cargar datos iniciales
  cargarEmpleados();

  // Asociar eventos a botones
  document
    .getElementById("btnGuardar")
    .addEventListener("click", guardarEmpleado);
  document
    .getElementById("btnModificar")
    .addEventListener("click", modificarEmpleado);
  document.getElementById("btnEliminar").addEventListener("click", function () {
    const id = document.getElementById("empleadoId").value;
    if (id) {
      confirmarEliminar(id);
    } else {
      alert("Por favor, seleccione un empleado para eliminar");
    }
  });
  document
    .getElementById("btnConsultar")
    .addEventListener("click", consultarEmpleados);
});
