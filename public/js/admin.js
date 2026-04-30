document.addEventListener("DOMContentLoaded", () => {
  // Si estamos en la página de admin
  if (window.location.pathname.includes("admin.html")) {
    loadAdminStats();
    loadRecentComprobantes();
  }

  // Si estamos en la página de comprobantes
  if (window.location.pathname.includes("comprobantes.html")) {
    loadAllComprobantes();
    // Si venimos del dashboard y se pidió abrir un comprobante en específico
    const openId = localStorage.getItem("openComprobanteId");
    if (openId) {
      // Esperar un momento a que la UI cargue
      setTimeout(() => {
        fetchComprobanteById(openId)
          .then((comp) => {
            if (comp) viewComprobante(comp.id, comp.imageUrl);
          })
          .catch((err) => console.error(err));
      }, 400);
      localStorage.removeItem("openComprobanteId");
    }
  }

  // Si estamos en la página de cupos
  if (window.location.pathname.includes("cupos.html")) {
    loadCupos();
  }
});

async function fetchComprobanteById(id) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/comprobantes/${id}`, {
      mode: "cors",
    });
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      if (data.success) return data.comprobante;
    }
    return null;
  } catch (error) {
    console.error("Error fetch comprobante by id", error);
    return null;
  }
}
const API_BASE = "http://localhost:3000";

async function loadAdminStats() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/stats`, {
      mode: "cors",
    });
    let data = null;
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await response.json();
    else data = { success: response.ok, stats: {} };

    if (data && data.success) {
      // Actualizar el DOM con las estadísticas
      const statValues = document.querySelectorAll(".stat-value");
      if (statValues.length >= 2) {
        // Suponiendo que el primer stat-value es ventas (mock) y el segundo comprobantes pendientes
        statValues[0].textContent = data.stats.weeklySales || "$0";
        statValues[1].textContent = data.stats.pendingComprobantes || "0";

        // Si quieres actualizar el total de órdenes en alguna parte:
        if (statValues.length >= 3) {
          statValues[2].textContent = data.stats.totalOrders || "0";
          statValues[2].nextElementSibling.querySelector("span").textContent =
            "Total de pedidos registrados";
        }
      }
    }
  } catch (error) {
    console.error("Error cargando stats:", error);
  }
}

// Exportar registros del día (hoy por defecto)
function exportToday(format) {
  const date = new Date().toISOString().slice(0, 10);
  const url = `${API_BASE}/api/admin/export/daily.${format === "pdf" ? "pdf" : "xlsx"}?date=${date}`;
  // Abrir en nueva pestaña para descargar
  window.open(url, "_blank");
}

// Añadir listeners si existen botones
document.addEventListener("DOMContentLoaded", () => {
  const btnX = document.getElementById("exportExcelBtn");
  const btnP = document.getElementById("exportPdfBtn");
  if (btnX) btnX.onclick = () => exportToday("xlsx");
  if (btnP) btnP.onclick = () => exportToday("pdf");
});

async function loadRecentComprobantes() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/comprobantes`, {
      mode: "cors",
    });
    let data = null;
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await response.json();
    else data = { success: response.ok, comprobantes: [] };

    if (data.success) {
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = ""; // Limpiar mock data

      // Mostrar solo los últimos 5 para el dashboard
      const recent = data.comprobantes.slice(0, 5);

      recent.forEach((comp) => {
        const badgeClass =
          comp.status === "Aprobado"
            ? "success"
            : comp.status === "Rechazado"
              ? "danger"
              : "warning";
        const dateStr = new Date(comp.createdAt).toLocaleDateString();

        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>#COC-${comp.id}</td>
                    <td>${comp.clienteNombre}</td>
                    <td>${comp.plan}</td>
                    <td>$${comp.amount}</td>
                    <td><span class="badge badge-${badgeClass}">${comp.status}</span></td>
                    <td>${dateStr}</td>
                    <td><a href="comprobantes.html" class="table-link" onclick="localStorage.setItem('openComprobanteId', ${comp.id})">Revisar</a></td>
                `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Error cargando comprobantes recientes:", error);
  }
}

async function loadAllComprobantes() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/comprobantes`, {
      mode: "cors",
    });
    let data = null;
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await response.json();
    else data = { success: response.ok, comprobantes: [] };

    if (data.success) {
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = ""; // Limpiar mock data

      data.comprobantes.forEach((comp) => {
        const dateStr = new Date(comp.createdAt).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const tr = document.createElement("tr");
        // Agregar clase active si está pendiente para resaltarlo
        if (comp.status === "Pendiente") tr.classList.add("active");

        tr.innerHTML = `
                    <td><span class="id-label">#COC-${comp.id}</span> ${dateStr}</td>
                    <td><strong>${comp.clienteNombre}</strong></td>
                    <td><span class="badge-plan">${comp.plan}</span></td>
                    <td><span class="estado-texto">${comp.status}</span></td>
                    <td>
                        <button onclick="viewComprobante(${comp.id}, '${comp.imageUrl}')" style="border: none; background: none; color: var(--primary); font-weight: 600; cursor: pointer;">
                            Ver detalles
                        </button>
                    </td>
                `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Error cargando todos los comprobantes:", error);
  }
}

// Función global para ver comprobante
window.viewComprobante = function (id, imageUrl) {
  const visorHeader = document.querySelector(".visor-header p");
  const imgContainer = document.querySelector(".img-comprobante-container img");

  if (visorHeader) visorHeader.textContent = `Orden #COC-${id}`;
  // imageUrl puede ser "/uploads/archivo.jpg" — convertir a URL completa si es relativa
  let fullUrl = imageUrl || "assets/LaCocaLogo.png";
  if (fullUrl && fullUrl.startsWith("/")) fullUrl = API_BASE + fullUrl;
  if (imgContainer) imgContainer.src = fullUrl;

  // Configurar botones de Aprobar/Rechazar
  const btnAprobar = document.querySelector(".btn-aprobar");
  const btnRechazar = document.querySelector(".btn-rechazar");

  if (btnAprobar) {
    btnAprobar.onclick = () => updateStatus(id, "Aprobado");
  }
  if (btnRechazar) {
    btnRechazar.onclick = () => updateStatus(id, "Rechazado");
  }
};

async function updateStatus(id, status) {
  if (!confirm(`¿Estás seguro de marcar como ${status}?`)) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/admin/comprobantes/${id}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    let data = null;
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await response.json();
    else data = { success: response.ok, message: response.statusText };
    if (data.success) {
      alert("Estado actualizado");
      loadAllComprobantes(); // Recargar la lista
    } else {
      alert("Error al actualizar: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Ocurrió un error al intentar actualizar");
  }
}

async function loadCupos() {
  try {
    // Obtener resumen de cupos
    const res = await fetch(`${API_BASE}/api/admin/cupos`, { mode: "cors" });
    const ct = res.headers.get("content-type") || "";
    let data = null;
    if (ct.includes("application/json")) data = await res.json();
    if (!data || !data.success) return;

    const { maxCupos, reserved, available } = data.cupos;

    const totalEl = document.getElementById("totalCupos");
    const reservedEl = document.getElementById("reservedCupos");
    const availableEl = document.getElementById("availableCupos");
    const progressEl = document.getElementById("cuposProgress");

    if (totalEl) totalEl.textContent = maxCupos !== null ? maxCupos : "—";
    if (reservedEl) reservedEl.textContent = reserved;
    if (availableEl)
      availableEl.textContent = available !== null ? available : "—";
    if (progressEl && maxCupos) {
      const pct = Math.min(100, Math.round((reserved / maxCupos) * 100));
      progressEl.style.width = `${pct}%`;
    }

    // Poblar tabla con suscripciones (limitado a 50)
    const subsRes = await fetch(`${API_BASE}/api/admin/subscriptions`, {
      mode: "cors",
    });
    const ct2 = subsRes.headers.get("content-type") || "";
    let subsData = null;
    if (ct2.includes("application/json")) subsData = await subsRes.json();
    if (!subsData || !subsData.success) return;

    const tbody = document.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    subsData.subscriptions.slice(0, 100).forEach((s) => {
      const tr = document.createElement("tr");
      const cliente = s.Cliente || {};
      const statusClass =
        s.status === "Activo"
          ? "confirmed"
          : s.status === "Pendiente"
            ? "pending"
            : "cancelled";
      const fecha = s.createdAt
        ? new Date(s.createdAt).toLocaleDateString("es-ES")
        : "";
      tr.innerHTML = `
        <td><strong>${cliente.nombre || "Sin Nombre"}</strong></td>
        <td>${s.barrio_1 || "N/A"}</td>
        <td>${s.plan}</td>
        <td><span class="status-chip ${statusClass}">${s.status}</span></td>
        <td>${fecha}</td>
        <td><button onclick="viewSubscription(${s.id})" class="table-link" style="border:none;background:none;color:var(--primary);cursor:pointer;font-weight:600;">Ver registro</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error cargando cupos:", error);
  }
}

// Abrir vista de registro completo
window.viewSubscription = function (id) {
  localStorage.setItem("openSubscriptionId", id);
  window.location.href = "registro.html";
};
