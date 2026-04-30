document.addEventListener("DOMContentLoaded", () => {
  const id =
    localStorage.getItem("openSubscriptionId") ||
    new URLSearchParams(window.location.search).get("id");
  if (!id) {
    document.getElementById("detalleContent").innerText =
      "No se especificó la suscripción.";
    return;
  }

  loadSubscriptionDetail(id);
});

async function loadSubscriptionDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/subscriptions/${id}`, {
      mode: "cors",
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      document.getElementById("detalleContent").innerText =
        "Respuesta inesperada del servidor.";
      return;
    }
    const data = await res.json();
    if (!data.success) {
      document.getElementById("detalleContent").innerText =
        data.message || "No se encontró la suscripción.";
      return;
    }

    const s = data.subscription;
    const cliente = s.Cliente || {};
    const comprobantes = s.Comprobantes || [];

    const html = `
            <div class="card">
                <h2>Cliente</h2>
                <p><strong>Nombre:</strong> ${cliente.nombre || "—"}</p>
                <p><strong>Cédula:</strong> ${cliente.cedula || "—"}</p>
                <p><strong>Email:</strong> ${cliente.email || "—"}</p>
                <p><strong>Celular:</strong> ${cliente.celular || "—"}</p>
                <p><strong>Activo:</strong> ${cliente.is_active ? "Sí" : "No"}</p>
            </div>

            <div class="card">
                <h2>Suscripción</h2>
                <p><strong>ID:</strong> ${s.id}</p>
                <p><strong>Plan:</strong> ${s.plan}</p>
                <p><strong>Needs Cocas:</strong> ${s.needs_cocas ? "Sí" : "No"}</p>
                <p><strong>Delivery Type:</strong> ${s.delivery_type}</p>
                <p><strong>Dirección 1:</strong> ${s.address_1 || "—"}</p>
                <p><strong>Barrio 1:</strong> ${s.barrio_1 || "—"}</p>
                <p><strong>Días dirección 1:</strong> ${s.days_address_1 || "—"}</p>
                <p><strong>Dirección 2:</strong> ${s.address_2 || "—"}</p>
                <p><strong>Barrio 2:</strong> ${s.barrio_2 || "—"}</p>
                <p><strong>Días dirección 2:</strong> ${s.days_address_2 || "—"}</p>
                <p><strong>Facturación electrónica:</strong> ${s.facturacion_electronica}</p>
                <p><strong>Total:</strong> $${s.total_price}</p>
                <p><strong>Estado:</strong> ${s.status}</p>
                <p><strong>Fecha creación:</strong> ${new Date(s.createdAt).toLocaleString()}</p>
            </div>

            <div class="card">
                <h2>Comprobantes (${comprobantes.length})</h2>
                <div class="comprobantes-list">
                    ${comprobantes
                      .map(
                        (c) => `
                        <div class="comprobante-item">
                            <img src="${c.image_url.startsWith("/") ? API_BASE + c.image_url : c.image_url}" alt="comprobante" style="max-width:220px;display:block;margin-bottom:8px;" />
                            <div><strong>Id:</strong> ${c.id}</div>
                            <div><strong>Estado:</strong> ${c.status}</div>
                            <div style="margin-top:6px;">
                                <button onclick="updateStatus(${c.id}, 'Aprobado')" class="btn btn-aprobar">Aprobar</button>
                                <button onclick="updateStatus(${c.id}, 'Rechazado')" class="btn btn-rechazar">Rechazar</button>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;

    document.getElementById("detalleContent").innerHTML = html;
  } catch (error) {
    console.error("Error cargando suscripción:", error);
    document.getElementById("detalleContent").innerText =
      "Error al cargar la información.";
  }
}
