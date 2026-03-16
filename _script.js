





// EXPORTACION DE LOS DATOS TOMADOS EN EL FORMULARIO A LA BASE DE DATOS.
const formulario = document.getElementById('formulario');
const mensaje = document.getElementById("respuesta");

formulario.addEventListener('submit', async function(event) {
  event.preventDefault();

  const formData = new FormData(formulario);
  const data = Object.fromEntries(formData.entries());
  data.titulo = document.title;
  data.usuario = sessionStorage.getItem(usuario_dinamico)
  console.log(data);

  try {
    // MESNSAGE TEMPORAL MIENTRAS SE EJECUTA EL SUBMIT
    mensaje.innerText = "⏳ Enviando datos...";
    mensaje.style.color = "blue";
    mensaje.style.display = "block";

    const resp = await fetch("https://verserweb-back-end-58996458362.us-central1.run.app/guardado_coordinacion_general", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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

      formulario.reset();
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


// FUNCION PARA IMPORTAR LOS NOMBRES DE LOS RESPONSABLES AL SELECT CORRESPOSNDIENTE.
async function cargarResponsables() {
  try {
    // 1) Pedir al backend la lista de responsables
    const resp = await fetch("https://verserweb-back-end-58996458362.us-central1.run.app/peticion_dannos_responsables"); // URL de tu backend en Cloud Run
    const responsables = await resp.json();

    // 2) Buscar el <select> en el HTML
    const select = document.getElementsByName("responsable")[0];
    select.innerHTML = "";

    // opción vacía (default)
    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "";
    select.appendChild(emptyOpt);

    // 3) Recorrer los responsables recibidos y crear <option>
    responsables.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.responsables;          // lo que se envía al backend
      opt.textContent = c.responsables; // lo que se muestra al usuario
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Error cargando responsables", err);
    document.getElementsByName("responsable")[0].innerHTML =
      "<option>Error al cargar</option>";
  }
}
// 4) Ejecutar la carga al abrir la página
if(document.title !== '___registro_de_control_inventario'){
  cargarResponsables();
}

// INICIO DE SECION
const pag= document.title
const usuario_dinamico = `usuario${pag}`;
// INICIO DE SECION
async function verificacion(){
  const pag= document.title
  const codigo = document.getElementById("codigo").value.trim();
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
      sessionStorage.setItem(usuario_dinamico, data.nombre); // RESPUESTA DEL BACK-END CON EL NUMBRE DE USUARIO
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
////

// FUNCION QUE PERMITE QUE EL CONTENIDO DE LA PAGINA SEA VISIBLE //
function mostrarContenido(nombre) {
  document.getElementById("login").style.display = "none";
  document.getElementById("formulario").style.display = "block";
  const subtitulo= document.getElementById("bienvenida")
  subtitulo.textContent = `Bienvenido, ${nombre}.`;
  subtitulo.style.display = "block";
}
////

// VERIFICA SI YA HAY SECION ACTIVA, Y SI ES ASI PERMITE VISUALIZAR LA PAGINA //
window.onload = () => {
  const sesion = sessionStorage.getItem(usuario_dinamico);
  if (sesion) mostrarContenido(sesion); // EJECUTA LA FUNCION QUE MUESTRA EL CONTENIDO Y COMPARTE EL NOMBRE DE USUARIO
};
////

// FUNCUION DE CIERRE DE SESION //
function cerrarSesion() {
  sessionStorage.removeItem(usuario_dinamico);
  document.getElementById("formulario").style.display = "none";
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

// GUNCION PARA _AR QUE MUESTRA Y OCULTA CAMPOS SEGUN EL TRATAMIENTO SELECCIONADO //
if(document.title === '___registro_de_control_ar'){
  document.getElementById("tratamiento").addEventListener("change", function() {
    const valor = this.value;
    if (valor === "REPROCESOS") {
      document.getElementById("cantidad_de_lentes_reprocesados").style.display = "block";
      document.getElementById("cantidad_de_lentes_reprocesados").required = true;
      document.getElementById("cdlr").style.display = "block";

      document.getElementById("cantidad_de_lentes_por_ciclo").style.display = "none";
      document.getElementById("cantidad_de_lentes_por_ciclo").required = false;
      document.getElementById("cdlpc").style.display = "none";

      document.getElementById("numero_del_ciclo").style.display = "none";
      document.getElementById("numero_del_ciclo").required = false;
      document.getElementById("ndc").style.display = "none";
    }
  else {
      document.getElementById("cantidad_de_lentes_reprocesados").style.display = "none";
      document.getElementById("cantidad_de_lentes_reprocesados").required = false;
      document.getElementById("cdlr").style.display = "none";

      document.getElementById("cantidad_de_lentes_por_ciclo").style.display = "block";
      document.getElementById("cantidad_de_lentes_por_ciclo").required = true;
      document.getElementById("cdlpc").style.display = "block";

      document.getElementById("numero_del_ciclo").style.display = "block";
      document.getElementById("numero_del_ciclo").required = true;
      document.getElementById("ndc").style.display = "block";
    }
  });
}

// FUNCION PARA INVENTARIO, QUE MUESTRA Y OCULTA CAMPOS SEGUN EL AREA SELECCIONADA //
if(document.title === '___registro_de_control_inventario'){
  document.getElementById("area").addEventListener("change", function() {
    const valor = this.value;

    const area_div = document.getElementById('area-div');
    area_div.querySelectorAll('input, select, textarea').forEach(el => {
      el.required = false;
    });

    document.querySelectorAll('.ocultar').forEach(div => {
      div.style.display = 'none';
    });

    if (valor === '') return;
    if (valor === 'AR') seleccion = document.getElementById('ar-div');
    if (valor === 'AUTOREGISTRO') seleccion = document.getElementById('autoregistro-div');
    if (valor === 'BISEL') seleccion = document.getElementById('bisel-div');
    if (valor === 'COATING') seleccion = document.getElementById('coating-div');
    if (valor === 'DIGITACION') seleccion = document.getElementById('digitacion-div');
    if (valor === 'INS. INICIAL') seleccion = document.getElementById('ins-inicial-div');
    if (valor === 'INS. FINAL') seleccion = document.getElementById('ins-final-div');
    if (valor === 'TALLA') seleccion = document.getElementById('talla-div');
    if (valor === 'RECEPCION') seleccion = document.getElementById('recepcion-div');

    if (seleccion){
      seleccion.style.display = 'block';

      seleccion.querySelectorAll('input, select, textarea').forEach(el => {
        el.required = true;
      });
    }
  })
}