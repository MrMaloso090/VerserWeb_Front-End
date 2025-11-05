//IMPORTACION DE LA LISTA DE CLIENTES DE MYSQL A AL SELECT DE LA WEB //
async function cargarClientes() {
  try {
    // 1) Pedir al backend la lista de clientes
    const resp = await fetch("https://verserweb-back-end-58996458362.us-central1.run.app/peticion_clientes"); // URL de tu backend en Cloud Run
    const clientes = await resp.json();

    // 2) Buscar el <select> en el HTML
    const select = document.getElementById("cliente");
    select.innerHTML = "";

    // 3) Recorrer los clientes recibidos y crear <option>
    clientes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.clientes;          // lo que se envía al backend
      opt.textContent = c.clientes; // lo que se muestra al usuario
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Error cargando clientes", err);
    document.getElementById("cliente").innerHTML =
      "<option>Error al cargar</option>";
  }
}

// 4) Ejecutar la carga al abrir la página
cargarClientes();
////




// FUNCION QUE PERMITE QUE EL CONTENIDO DE LA PAGINA SEA VISIBLE //
function mostrarContenido(nombre) {
  document.getElementById("login").style.display = "none";
  document.getElementById("cuestionario").style.display = "block";
  const subtitulo= document.getElementById("bienvenida")
  subtitulo.textContent = nombre;
  subtitulo.style.display = "block";
}
////

// VERIFICA SI YA HAY SECION ACTIVA, Y SI ES ASI PERMITE VISUALIZAR LA PAGINA //
window.onload = () => {
  const sesion = sessionStorage.getItem("usuario_reprocesos");
  if (sesion) mostrarContenido(sesion); // EJECUTA LA FUNCION QUE MUESTRA EL CONTENIDO Y COMPARTE EL NOMBRE DE USUARIO
};
////

// FUNCION QUE VERIFICA EL PIN DEL USUARIO //
async function verificacion() {
  const codigo = document.getElementById("codigo").value.trim();
  const pag = "reprocesos"; //NOMBRE DE LA PAGINA, PARA SU IDENTIFICACION
  const error = document.getElementById("error");

  error.style.display = "none";

  try {
    const resp = await fetch("https://verserweb-back-end-58996458362.us-central1.run.app/login_usuario", { //LINK DE CLOUD RUN AL BACK-END
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, pag })
    });

    const data = await resp.json(); //RESPUESTA DEL BACK-END

    if (data.valido) { // RESPUESTA DEL BACK-END INFORMANDO SI VALIDO ES TRHUE O FALSE
      sessionStorage.setItem("usuario_reprocesos", data.nombre); // RESPUESTA DEL BACK-END CON EL NUMBRE DE USUARIO
      mostrarContenido(data.nombre); // EJECUTA LA FUNCION QUE MUESTRA EL CONTENIDO Y COMPARTE EL NOMBRE DE USUARIO
    } else {
      error.innerText = "Código incorrecto. Intenta nuevamente.";
      error.style.display = "block";
    }

  } catch (err) {
    console.error("Error de autenticación:", err);

    if (err.message.includes("conectar") || err.message.includes("Failed to fetch")) {
      error.innerText = "⚠️ No ha sido posible establecer conexion con el servidor.";
    } else {
      error.innerText = "❌ Ocurrió un error inesperado.";
    }

    error.style.display = "block";
  }
}

// FUNCUION DE CIERRE DE SESION //
function cerrarSesion() {
  sessionStorage.removeItem("usuario_reprocesos");
  document.getElementById("cuestionario").style.display = "none";
  document.getElementById("login").style.display = "block";

  const subtitulo= document.getElementById("bienvenida")
  subtitulo.textContent = "";
  subtitulo.style.display = "none";

  // limpiar todos los inputs y selects
  document.querySelectorAll("input, select, textarea").forEach(el => {
    if (el.type === "checkbox" || el.type === "radio") {
      el.checked = false;
    } else {
      el.value = "";
    }
  });
}
////

// FUNCION PARA EXPORTAR LOS DATOS A LA BASE DDE DATOS. //
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const mensaje = document.getElementById("mensaje_respuesta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // EVITA LA RECCARGA DE LA PAGINA QUE DA POR DEFECTO EL HTML AL PRECIONAR ENVIAR.

    const datos = {
      tabla: "_reprocesos", // SE ESPESIFICA EL NOMBRE DE LA TABLA DESTINO //

      numero_de_orden: form.numero_orden.value,
      area_responsable: form.area_responsable.value,
      lente: form.lente.value,
      motivo: form.motivo.value,
      material: form.material.value,
      observaciones: form.observacion.value.trim(),
      
      usuario: sessionStorage.getItem("usuario_reprocesos") // SE ESPESIFICA EN CUAL WEB ESTAMOS //
    };

    try {
      // MESNSAGE TEMPORAL MIENTRAS SE EJECUTA EL SUBMIT
      mensaje.innerText = "⏳ Enviando datos...";
      mensaje.style.color = "blue";
      mensaje.style.display = "block";
      
      // DATOS PARA VER EN LA CONSOLA.
      console.log("📦 Enviando datos:", datos);
      console.log("🧾 JSON:", JSON.stringify(datos, null, 2));

      // LINK AL SERVIDOR QUE REALIZA LA CONEXION AL BACK END
      const resp = await fetch("https://verserweb-back-end-58996458362.us-central1.run.app/guardado_en_DBs_IDR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      // Intentar leer el JSON aunque haya error HTTP
      const respuesta = await resp.json().catch(() => ({}));

      // Si el backend respondió con error (400, 500, etc.)
      if (!resp.ok) {
        const msg = respuesta.error || respuesta.detalle || `Error HTTP ${resp.status}`;
        throw new Error(msg);
      }

      // Manejo normal
      if (respuesta.error) {
        mensaje.innerText = "⚠️ " + respuesta.error;
        mensaje.style.color = "red";
        mensaje.style.display = "block";
        return;
      }

      if (respuesta.complete) {
        mensaje.innerText = "✅ " + respuesta.complete;
        mensaje.style.color = "green";
        mensaje.style.display = "block";

        form.reset();
        return;
      }

      mensaje.innerText = "❔ Respuesta inesperada del servidor.";
      mensaje.style.color = "orange";
      mensaje.style.display = "block";

    } catch (error) {
      console.error("Error al guardar datos:", error);
      mensaje.style.color = "red";
      mensaje.style.display = "block";

      if (error.message.includes("conectar") || error.message.includes("Failed to fetch")) {
        mensaje.innerText = "⚠️ No ha sido posible establecer conexión con el servidor. \n(DB caida o Fallo en Cloud run)";
      } else {
        mensaje.innerText = "⚠️ " + error.message;
      }
    }
  });
});