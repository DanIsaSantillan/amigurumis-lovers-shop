// 1. Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCaPUhEUEQsWO7hcqCuPQVKfK5lMvmOUTM",
  authDomain: "amigurumis-lovers-shop.firebaseapp.com",
  projectId: "amigurumis-lovers-shop",
  storageBucket: "amigurumis-lovers-shop.firebasestorage.app",
  messagingSenderId: "511788785721",
  appId: "1:511788785721:web:a9d52ddf4d45587556ede8"
};

// Inicializar Firebase y Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  const formComentario = document.getElementById('formComentario');
  const listaComentarios = document.getElementById('listaComentarios');

  if (!formComentario || !listaComentarios) return; // Protección si la sección no existe en el HTML

  // 2. Escuchar los comentarios en TIEMPO REAL desde Firestore
  db.collection("comentarios").orderBy("fechaOrden", "desc").onSnapshot((snapshot) => {
    listaComentarios.innerHTML = '';

    if (snapshot.empty) {
      listaComentarios.innerHTML = `
        <div class="text-center text-muted small fst-italic p-3 bg-light rounded border">
          Aún no hay comentarios publicados. ¡Sé la primera en probar la sección! ✨
        </div>
      `;
      return;
    }

    snapshot.forEach((doc) => {
      const comentario = doc.data();
      const docId = doc.id; // ID único del documento en Firestore
      const estrellas = '⭐'.repeat(comentario.estrellas);
      const tarjeta = document.createElement('div');
      tarjeta.className = 'card p-3 shadow-sm border-0 bg-light mb-3';

      // HTML de la respuesta de la Creadora (si ya respondiste)
      let htmlRespuesta = '';
      if (comentario.respuestaCreadora) {
        htmlRespuesta = `
          <div class="mt-3 p-2 bg-white rounded border-start border-3 border-dark ms-3">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-dark text-white fw-bold" style="font-size: 0.75rem;">
                🧶 Marseline | Artesana
              </span>
              <span class="text-muted" style="font-size: 0.7rem;">${comentario.fechaRespuesta}</span>
            </div>
            <p class="text-dark small m-0 fst-italic">"${comentario.respuestaCreadora}"</p>
          </div>
        `;
      } else {
        // Botón de respuesta con candado de seguridad (pasa el ID único de Firestore)
        htmlRespuesta = `
          <div class="mt-2 text-end">
            <button onclick="responderComoCreadora('${docId}')" class="btn btn-outline-dark btn-sm py-0 px-2" style="font-size: 0.75rem;">
              💬 Responder como Creadora
            </button>
          </div>
        `;
      }

      tarjeta.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-dark small">${comentario.nombre}</strong>
          <span class="small">${estrellas}</span>
        </div>
        <p class="text-secondary small m-0">${comentario.texto}</p>
        <div class="text-end text-muted" style="font-size: 0.7rem;">${comentario.fecha}</div>
        ${htmlRespuesta}
      `;

      listaComentarios.appendChild(tarjeta);
    });
  }, (error) => {
    console.error("Error al escuchar comentarios:", error);
  });

  // 3. Enviar un nuevo comentario a Firestore
  formComentario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreCliente').value.trim();
    const estrellas = parseInt(document.getElementById('calificacionCliente').value);
    const texto = document.getElementById('textoComentario').value.trim();
    const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

    const nuevoComentario = {
      nombre,
      estrellas,
      texto,
      fecha,
      fechaOrden: firebase.firestore.FieldValue.serverTimestamp(), // Para ordenar de más reciente a más antiguo
      respuestaCreadora: null,
      fechaRespuesta: null
    };

    // Guardar en la base de datos Firestore
    db.collection("comentarios").add(nuevoComentario)
      .then(() => {
        formComentario.reset();
      })
      .catch((error) => {
        console.error("Error al guardar comentario:", error);
        alert("Hubo un detalle al publicar tu comentario. Por favor intenta de nuevo.");
      });
  });

  // 4. Función de respuesta EXCLUSIVA para la Creadora (Protegida por PIN en la nube)
  window.responderComoCreadora = function(docId) {
    const pinIngresado = prompt("🔒 Área exclusiva. Ingresa tu PIN de Creadora:");

    if (pinIngresado === "280900") {
      const respuesta = prompt("¡PIN correcto! Escribe tu respuesta pública:");
      if (respuesta && respuesta.trim() !== "") {
        const fechaRespuesta = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

        // Actualizar la reseña directamente en Firestore
        db.collection("comentarios").doc(docId).update({
          respuestaCreadora: respuesta.trim(),
          fechaRespuesta: fechaRespuesta
        })
        .then(() => {
          console.log("Respuesta de Creadora guardada con éxito.");
        })
        .catch((error) => {
          console.error("Error al responder:", error);
          alert("No se pudo guardar la respuesta.");
        });
      }
    } else if (pinIngresado !== null) {
      alert("❌ PIN incorrecto. Acceso denegado.");
    }
  };
});
