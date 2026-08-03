document.addEventListener('DOMContentLoaded', () => {

    const modalUniversal = document.getElementById('modalUniversal');
    const inputCantidad = document.getElementById('modalCantidad');
    const inputNotas = document.getElementById('modalNotas');

    let precioBaseNum = 0;
    let diasBaseNum = 0;
    let nombreProducto = '';

    if (modalUniversal) {
        modalUniversal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;

            nombreProducto = button.getAttribute('data-nombre');
            precioBaseNum = parseFloat(button.getAttribute('data-precio-num'));
            diasBaseNum = parseInt(button.getAttribute('data-dias-base'));
            const descripcion = button.getAttribute('data-descripcion');
            const imagen = button.getAttribute('data-imagen');

            if (inputCantidad) inputCantidad.value = 1;
            if (inputNotas) inputNotas.value = '';

            modalUniversal.querySelector('#modalNombre').textContent = nombreProducto;
            modalUniversal.querySelector('#modalDescripcion').textContent = descripcion;
            modalUniversal.querySelector('#modalImagen').src = imagen;

            actualizarPedido();
        });

        if (inputCantidad) {
            inputCantidad.addEventListener('input', () => {
                if (inputCantidad.value > 10) inputCantidad.value = 10;
                if (inputCantidad.value < 1 || inputCantidad.value === '') inputCantidad.value = 1;
                actualizarPedido();
            });
        }

        if (inputNotas) {
            inputNotas.addEventListener('input', actualizarPedido);
        }
    }

    function actualizarPedido() {
        const cantidad = inputCantidad ? parseInt(inputCantidad.value) || 1 : 1;
        const notas = inputNotas ? inputNotas.value.trim() : '';

        const precioTotal = precioBaseNum * cantidad;
        const anticipo = precioTotal * 0.5;

        // Días de fabricación (Aumentan según la cantidad de piezas)
        const diasTejidoMin = diasBaseNum + (cantidad - 1) * 2;
        const diasTejidoMax = diasTejidoMin + 2;

        // Días de MexPost fijos (5 a 10 días)
        const envioFijoMin = 5;
        const envioFijoMax = 10;

        // TOTAL DE DÍAS = Fabricación + Envío Fijo
        const totalMin = diasTejidoMin + envioFijoMin;
        const totalMax = diasTejidoMax + envioFijoMax;

        // Actualizamos en pantalla
        const elPrecioTotal = document.getElementById('modalPrecioTotal');
        const elAnticipo = document.getElementById('modalAnticipo');
        const elTiempoTejido = document.getElementById('modalTiempoTejido');
        const elTiempoTotalEntrega = document.getElementById('modalTiempoTotalEntrega');

        if (elPrecioTotal) elPrecioTotal.textContent = `$ ${precioTotal} MXN`;
        if (elAnticipo) elAnticipo.textContent = `$ ${anticipo} MXN`;
        if (elTiempoTejido) elTiempoTejido.textContent = `${diasTejidoMin} a ${diasTejidoMax} días hábiles`;
        if (elTiempoTotalEntrega) elTiempoTotalEntrega.textContent = `${totalMin} a ${totalMax} días hábiles`;

        const telefonoWhatsApp = "524493463574";
        let detalleNotas = notas !== '' ? `\n🎨 *Personalización:* ${notas}` : '';

        // Formato limpio pegado a la izquierda para evitar espacios raros en WhatsApp
        const mensaje = `¡Hola! Me interesa encargar el siguiente amigurumi:

📌 *Producto:* ${nombreProducto}
🧶 *Cantidad:* ${cantidad} unidad(es)${detalleNotas}
💰 *Total (Envío MexPost gratis):* $ ${precioTotal} MXN
💳 *Anticipo requerido (50%):* $ ${anticipo} MXN

⏱️ *Fabricación:* ${diasTejidoMin}-${diasTejidoMax} días hábiles
📦 *Envío MexPost:* 5-10 días hábiles
🗓️ *Tiempo total estimado:* ${totalMin}-${totalMax} días hábiles

¿Me podrías proporcionar los datos para realizar la transferencia del anticipo?`;

        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${telefonoWhatsApp}&text=${encodeURIComponent(mensaje)}`;
        const botonPedido = document.getElementById('modalBotonContacto');
        if (botonPedido) botonPedido.href = urlWhatsApp;
    }

    function cargarProductos() {
        fetch('Atributos/json/productos.json')
            .then(response => response.json())
            .then(productos => {
                const contenedor = document.getElementById('contenedorProductos');
                if (!contenedor) return;

                contenedor.innerHTML = ''; 

                productos.forEach(producto => {
                    const cardHTML = `
                    <div class="col-12 col-md-6 col-lg-4 mb-4">
                        <div class="card card-amigurumi">
                            <a href="${producto.instagram}" target="_blank" title="Ver en Instagram" class="card-img-link">
                                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                            </a>
                            <div class="card-body">
                                <div>
                                    <h5 class="card-title fw-bold">${producto.nombre}</h5>
                                    <p class="card-text">${producto.descripcion}</p>
                                </div>
                                <div class="mt-3 pt-3 border-top d-flex align-items-center justify-content-between">
                                    <span class="precio">$ ${producto.precio} MXN</span>
                                    <button
                                        type="button"
                                        class="btn btn-dark btn-sm fw-bold"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modalUniversal"
                                        data-nombre="${producto.nombre}"
                                        data-precio-num="${producto.precio}"
                                        data-dias-base="${producto.diasBase}"
                                        data-descripcion="${producto.descripcion}"
                                        data-imagen="${producto.imagen}">
                                        Ordenar <i class="bi bi-cart3"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    contenedor.innerHTML += cardHTML;
                });
            })
            .catch(error => console.error('Error al cargar productos:', error));            
    }

    cargarProductos();
});
