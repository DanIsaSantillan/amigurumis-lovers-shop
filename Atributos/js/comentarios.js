document.addEventListener('DOMContentLoaded', () => {
  const formComentario = document.getElementById('formComentario');
  const listaComentarios = document.getElementById('listaComentarios');

  if (!formComentario || !listaComentarios) return; // Protección si la sección no existe en el HTML

  // 1. Cargar comentarios guardados desde el navegador (localStorage)
  let comentariosGuardados = JSON.parse(localStorage.getItem('misComentariosAmigurumis')) || [];

  function renderizarComentarios() {
    listaComentarios.innerHTML = '';

    if (comentariosGuardados.length === 0) {
      listaComentarios.innerHTML = `
        <div class="text-center text-muted small fst-italic p-3 bg-light rounded border">
          Aún no hay comentarios publicados. ¡Sé la primera en probar la sección! ✨
        </div>
      `;
      return;
    }

    comentariosGuardados.forEach((comentario, index) => {
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
        // Botón de respuesta con candado de seguridad
        htmlRespuesta = `
          <div class="mt-2 text-end">
            <button onclick="responderComoCreadora(${index})" class="btn btn-outline-dark btn-sm py-0 px-2" style="font-size: 0.75rem;">
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
  }

  // 2. Enviar un nuevo comentario de cliente
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
      respuestaCreadora: null,
      fechaRespuesta: null
    };

    comentariosGuardados.unshift(nuevoComentario);
    localStorage.setItem('misComentariosAmigurumis', JSON.stringify(comentariosGuardados));

    renderizarComentarios();
    formComentario.reset();
  });

  // 3. Función de respuesta EXCLUSIVA para la Creadora (Protegida por PIN)
  window.responderComoCreadora = function(index) {
    const pinIngresado = prompt("🔒 Área exclusiva. Ingresa tu PIN de Creadora:");

    // Verificación de clave
    if (pinIngresado === "280900") {
      const respuesta = prompt("¡PIN correcto! Escribe tu respuesta pública:");
      if (respuesta && respuesta.trim() !== "") {
        const fechaRespuesta = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        
        comentariosGuardados[index].respuestaCreadora = respuesta.trim();
        comentariosGuardados[index].fechaRespuesta = fechaRespuesta;
        
        localStorage.setItem('misComentariosAmigurumis', JSON.stringify(comentariosGuardados));
        renderizarComentarios();
      }
    } else if (pinIngresado !== null) {
      alert("❌ PIN incorrecto. Acceso denegado.");
    }
  };

  renderizarComentarios();
});