document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en la página de admin
    if (window.location.pathname.includes('admin.html')) {
        loadAdminStats();
        loadRecentComprobantes();
    }

    // Si estamos en la página de comprobantes
    if (window.location.pathname.includes('comprobantes.html')) {
        loadAllComprobantes();
    }
});

async function loadAdminStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.success) {
            // Actualizar el DOM con las estadísticas
            const statValues = document.querySelectorAll('.stat-value');
            if (statValues.length >= 2) {
                // Suponiendo que el primer stat-value es ventas (mock) y el segundo comprobantes pendientes
                statValues[0].textContent = data.stats.weeklySales || '$0';
                statValues[1].textContent = data.stats.pendingComprobantes || '0';
                
                // Si quieres actualizar el total de órdenes en alguna parte:
                if (statValues.length >= 3) {
                    statValues[2].textContent = data.stats.totalOrders || '0';
                    statValues[2].nextElementSibling.querySelector('span').textContent = 'Total de pedidos registrados';
                }
            }
        }
    } catch (error) {
        console.error('Error cargando stats:', error);
    }
}

async function loadRecentComprobantes() {
    try {
        const response = await fetch('/api/admin/comprobantes');
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = ''; // Limpiar mock data
            
            // Mostrar solo los últimos 5 para el dashboard
            const recent = data.comprobantes.slice(0, 5);
            
            recent.forEach(comp => {
                const badgeClass = comp.status === 'Aprobado' ? 'success' : (comp.status === 'Rechazado' ? 'danger' : 'warning');
                const dateStr = new Date(comp.createdAt).toLocaleDateString();
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#COC-${comp.id}</td>
                    <td>${comp.clienteNombre}</td>
                    <td>${comp.plan}</td>
                    <td>$${comp.amount}</td>
                    <td><span class="badge badge-${badgeClass}">${comp.status}</span></td>
                    <td>${dateStr}</td>
                    <td><a href="comprobantes.html" class="table-link">Revisar</a></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error cargando comprobantes recientes:', error);
    }
}

async function loadAllComprobantes() {
    try {
        const response = await fetch('/api/admin/comprobantes');
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = ''; // Limpiar mock data
            
            data.comprobantes.forEach(comp => {
                const dateStr = new Date(comp.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                
                const tr = document.createElement('tr');
                // Agregar clase active si está pendiente para resaltarlo
                if(comp.status === 'Pendiente') tr.classList.add('active');
                
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
        console.error('Error cargando todos los comprobantes:', error);
    }
}

// Función global para ver comprobante
window.viewComprobante = function(id, imageUrl) {
    const visorHeader = document.querySelector('.visor-header p');
    const imgContainer = document.querySelector('.img-comprobante-container img');
    
    if(visorHeader) visorHeader.textContent = `Orden #COC-${id}`;
    if(imgContainer) imgContainer.src = imageUrl || 'assets/LaCocaLogo.png'; // Fallback a un logo si no hay imagen
    
    // Configurar botones de Aprobar/Rechazar
    const btnAprobar = document.querySelector('.btn-aprobar');
    const btnRechazar = document.querySelector('.btn-rechazar');
    
    if(btnAprobar) {
        btnAprobar.onclick = () => updateStatus(id, 'Aprobado');
    }
    if(btnRechazar) {
        btnRechazar.onclick = () => updateStatus(id, 'Rechazado');
    }
}

async function updateStatus(id, status) {
    if(!confirm(`¿Estás seguro de marcar como ${status}?`)) return;
    
    try {
        const response = await fetch(`/api/admin/comprobantes/${id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        if(data.success) {
            alert('Estado actualizado');
            loadAllComprobantes(); // Recargar la lista
        } else {
            alert('Error al actualizar: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar actualizar');
    }
}
