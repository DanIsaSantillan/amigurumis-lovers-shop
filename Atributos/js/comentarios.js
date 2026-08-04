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

// Variables de Seguridad Anti-Fuerza Bruta
let intentosFallidos = 0;
let bloqueoHasta = 0;
let modoCreadoraActivado = false; // Estado del modo administración

document.addEventListener('DOMContentLoaded', () => {
  const formComentario = document.getElementById('formComentario');
  const listaComentarios = document.getElementById('listaComentarios');

  if (!formComentario || !listaComentarios) return;

  // 2. Escuchar comentarios en TIEMPO REAL
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
      const docId = doc.id;
      const estrellas = '⭐'.repeat(comentario.estrellas);
      const tarjeta = document.createElement('div');
      tarjeta.className = 'card p-3 shadow-sm border-0 bg-light mb-3';

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
      } else if (modoCreadoraActivado) {
        // EL BOTÓN SOLO APARECE SI ACTIVASTE EL MODO CREADORA
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

  // 3. Enviar un nuevo comentario
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
      fechaOrden: firebase.firestore.FieldValue.serverTimestamp(),
      respuestaCreadora: null,
      fechaRespuesta: null
    };

    db.collection("comentarios").add(nuevoComentario)
      .then(() => {
        formComentario.reset();
      })
      .catch((error) => {
        console.error("Error al guardar comentario:", error);
        alert("Hubo un detalle al publicar tu comentario. Por favor intenta de nuevo.");
      });
  });

  // 4. Función de respuesta protegida con Bloqueo Anti-Fuerza Bruta
  window.responderComoCreadora = function(docId) {
    const respuesta = prompt("Escribe tu respuesta pública como Creadora:");
    if (respuesta && respuesta.trim() !== "") {
      const fechaRespuesta = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

      db.collection("comentarios").doc(docId).update({
        respuestaCreadora: respuesta.trim(),
        fechaRespuesta: fechaRespuesta
      })
      .then(() => {
        console.log("Respuesta guardada con éxito.");
      })
      .catch((error) => {
        console.error("Error al responder:", error);
        alert("No se pudo guardar la respuesta.");
      });
    }
  };

  // 5. TRUCO DE CREADORA: Activar modo administración presionado una combinación o un botón discreto
  window.activarModoCreadora = function() {
    const ahora = Date.now();

    // Comprobar si está bloqueado por demasiados intentos
    if (ahora < bloqueoHasta) {
      const minRestantes = Math.ceil((bloqueoHasta - ahora) / 1000 / 60);
      alert(`⚠️ Demasiados intentos fallidos. Sistema bloqueado. Intenta en ${minRestantes} minuto(s).`);
      return;
    }

    const pinIngresado = prompt("🔒 Área de administración. Ingresa tu PIN:");

    if (pinIngresado === "280900") {
      intentosFallidos = 0;
      modoCreadoraActivado = true;
      alert("✅ Modo Creadora Activado. Ahora verás los botones de responder en las reseñas.");
      // Forzar recarga visual para mostrar los botones
      location.reload(); 
    } else if (pinIngresado !== null) {
      intentosFallidos++;
      if (intentosFallidos >= 3) {
        bloqueoHasta = Date.now() + (5 * 60 * 1000); // Bloqueo de 5 minutos
        intentosFallidos = 0;
        alert("❌ PIN incorrecto. Acceso bloqueado durante 5 minutos.");
      } else {
        alert(`❌ PIN incorrecto. Te quedan ${3 - intentosFallidos} intento(s).`);
      }
    }
  };
});
