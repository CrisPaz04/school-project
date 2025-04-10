function login() {
  const usuario = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!usuario || !password) {
    alert("Por favor, complete todos los campos");
    return;
  }

  const formData = new FormData();
  formData.append("username", usuario);
  formData.append("password", password);

  fetch("auth/login.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        sessionStorage.setItem("userType", data.userType);
        sessionStorage.setItem("username", usuario);

        window.location.href = "index.html";
      } else {
        alert("Credenciales incorrectas. Por favor, intente de nuevo.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al iniciar sesión. Por favor, intente de nuevo.");
    });
}

function verificarPermisos() {
  const userType = sessionStorage.getItem("userType");

  if (!userType) {
    window.location.href = "login.html";
    return false;
  }

  if (userType === "profesor_guia") {
    const deleteStudentBtns = document.querySelectorAll(".delete-student-btn");
    deleteStudentBtns.forEach((btn) => (btn.style.display = "none"));

    const updateClassBtns = document.querySelectorAll(".update-class-btn");
    const deleteClassBtns = document.querySelectorAll(".delete-class-btn");
    updateClassBtns.forEach((btn) => (btn.style.display = "none"));
    deleteClassBtns.forEach((btn) => (btn.style.display = "none"));

    const createTeacherBtns = document.querySelectorAll(".create-teacher-btn");
    const updateTeacherBtns = document.querySelectorAll(".update-teacher-btn");
    const deleteTeacherBtns = document.querySelectorAll(".delete-teacher-btn");
    createTeacherBtns.forEach((btn) => (btn.style.display = "none"));
    updateTeacherBtns.forEach((btn) => (btn.style.display = "none"));
    deleteTeacherBtns.forEach((btn) => (btn.style.display = "none"));
  }

  return true;
}

function logout() {
  sessionStorage.removeItem("userType");
  sessionStorage.removeItem("username");

  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  }

  verificarPermisos();
});
