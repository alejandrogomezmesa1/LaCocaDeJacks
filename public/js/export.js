// Lógica para exportación a Excel usando ExcelJS y FileSaver

async function exportExcel(type) {
  try {
    if (typeof ExcelJS === 'undefined') {
      showToast('Cargando librerías de exportación...', 'yellow');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'La Coca De Jacks';
    workbook.created = new Date();

    const today = new Date().toISOString().split('T')[0];
    let fileName = `Reporte_${type}_${today}.xlsx`;

    // Helpers
    const styleHeader = (worksheet, color = 'FF16A34A') => {
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
        };
      });
      headerRow.height = 25;
    };

    const applyBorders = (worksheet) => {
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
          if (rowNumber > 1) {
            cell.alignment = { vertical: 'middle' };
          }
        });
      });
    };

    // ─── REPORTES DE CLIENTES ───
    if (['todos', 'activos', 'vencer'].includes(type)) {
      let data = ALL_CLIENTS;
      let sheetName = 'Clientes';
      let headerColor = 'FF2563EB'; // Azul

      if (type === 'activos') {
        data = ALL_CLIENTS.filter(c => c.status === 'activo');
        sheetName = 'Activos';
        headerColor = 'FF16A34A'; // Verde
      } else if (type === 'vencer') {
        data = ALL_CLIENTS.filter(c => c.status === 'activo' && c.diasRestantes <= 5);
        sheetName = 'Por Vencer';
        headerColor = 'FFEA580C'; // Naranja
      }

      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 25 },
        { header: 'Cédula', key: 'cedula', width: 15 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Correo', key: 'correo', width: 25 },
        { header: 'Estado', key: 'status', width: 12 },
        { header: 'Plan', key: 'plan', width: 15 },
        { header: 'Días Rest.', key: 'dias', width: 10 },
        { header: 'Vencimiento', key: 'vencimiento', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 30 },
        { header: 'Barrio', key: 'barrio', width: 20 },
        { header: 'Fact. Electrónica', key: 'facturacion', width: 15 },
        { header: 'Alergias/Restr.', key: 'restricciones', width: 30 }
      ];

      data.forEach(c => {
        worksheet.addRow({
          nombre: c.nombre,
          cedula: c.cedula,
          telefono: c.telefono,
          correo: c.correo,
          status: c.status.toUpperCase(),
          plan: c.plan.toUpperCase(),
          dias: c.diasRestantes > 0 ? c.diasRestantes : 'Vencido',
          vencimiento: formatDate(c.fechaVencimiento, 'short'),
          direccion: c.direccion,
          barrio: c.barrio,
          facturacion: c.facturacionElectronica,
          restricciones: [c.alergias ? `ALERGIA: ${c.alergias}` : '', c.restricciones ? `RESTRICCION: ${c.restricciones}` : ''].filter(Boolean).join(' | ')
        });
      });

      styleHeader(worksheet, headerColor);
      applyBorders(worksheet);

      // Resaltar vencidos / por vencer
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const dias = row.getCell('dias').value;
          if (dias === 'Vencido') {
            row.getCell('dias').font = { color: { argb: 'FFDC2626' }, bold: true };
          } else if (typeof dias === 'number' && dias <= 5) {
            row.getCell('dias').font = { color: { argb: 'FFEA580C' }, bold: true };
          }
          
          const status = row.getCell('status').value;
          if (status === 'ACTIVO') row.getCell('status').font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (status === 'VENCIDO') row.getCell('status').font = { color: { argb: 'FFDC2626' }, bold: true };
        }
      });
    }

    // ─── REPORTE DE PAGOS PENDIENTES ───
    else if (type === 'pagos') {
      const worksheet = workbook.addWorksheet('Pagos Pendientes');
      worksheet.columns = [
        { header: 'Cliente', key: 'cliente', width: 25 },
        { header: 'Plan', key: 'plan', width: 15 },
        { header: 'Monto (COP)', key: 'monto', width: 15 },
        { header: 'Método', key: 'metodo', width: 15 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 }
      ];

      const pending = payments.filter(p => p.status === 'pendiente');
      pending.forEach(p => {
        worksheet.addRow({
          cliente: p.clienteNombre,
          plan: p.plan,
          monto: p.monto,
          metodo: p.metodo,
          fecha: formatDate(p.fecha, 'short'),
          estado: p.status.toUpperCase()
        });
      });

      styleHeader(worksheet, 'FFEAB308'); // Amarillo
      applyBorders(worksheet);
      
      // Formato moneda
      worksheet.getColumn('monto').numFmt = '"$"#,##0.00';
    }

    // ─── REPORTE DE PRODUCCIÓN ───
    else if (type === 'produccion') {
      const activeClients = ALL_CLIENTS.filter(c => c.status === 'activo');
      
      // Hoja 1: Resumen Consolidado
      const wsResumen = workbook.addWorksheet('Resumen Producción');
      wsResumen.columns = [
        { header: 'Plan', key: 'plan', width: 25 },
        { header: 'Cantidad Total Activa', key: 'cantidad', width: 25 }
      ];

      const resumen = { semanal: 0, quincenal: 0, mensual: 0 };
      activeClients.forEach(c => {
        if(resumen[c.plan] !== undefined) resumen[c.plan]++;
      });

      wsResumen.addRow({ plan: 'SEMANAL', cantidad: resumen.semanal });
      wsResumen.addRow({ plan: 'QUINCENAL', cantidad: resumen.quincenal });
      wsResumen.addRow({ plan: 'MENSUAL', cantidad: resumen.mensual });
      wsResumen.addRow({ plan: 'TOTAL COCAS HOY', cantidad: activeClients.length });
      
      styleHeader(wsResumen, 'FF9333EA'); // Morado
      applyBorders(wsResumen);
      wsResumen.getRow(5).font = { bold: true };

      // Hoja 2: Detalle de Cocina (Logística)
      const wsDetalle = workbook.addWorksheet('Logística y Cocina');
      wsDetalle.columns = [
        { header: 'Nombre', key: 'nombre', width: 25 },
        { header: 'Plan', key: 'plan', width: 12 },
        { header: 'Alergias / Restricciones', key: 'restricciones', width: 40 },
        { header: 'Dirección de Entrega', key: 'direccion', width: 35 },
        { header: 'Teléfono', key: 'telefono', width: 15 }
      ];

      activeClients.forEach(c => {
        const rest = [c.alergias ? `ALERGIA: ${c.alergias}` : '', c.restricciones ? `RESTR.: ${c.restricciones}` : ''].filter(Boolean).join(' | ');
        wsDetalle.addRow({
          nombre: c.nombre,
          plan: c.plan.toUpperCase(),
          restricciones: rest || 'Ninguna',
          direccion: `${c.direccion} (${c.barrio})`,
          telefono: c.telefono
        });
      });

      styleHeader(wsDetalle, 'FF4F46E5'); // Indigo
      applyBorders(wsDetalle);

      // Resaltar filas con restricciones
      wsDetalle.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rest = row.getCell('restricciones').value;
          if (rest !== 'Ninguna') {
            row.getCell('restricciones').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Fondo rojo muy claro
            row.getCell('restricciones').font = { color: { argb: 'FF991B1B' }, bold: true };
          }
        }
      });
    }

    // ─── GENERAR DESCARGA ───
    showToast(`Generando reporte de ${type}...`, 'green');
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    
    showToast(`Reporte ${fileName} descargado con éxito.`, 'green');

  } catch (error) {
    console.error('Error exportando Excel:', error);
    showToast('Ocurrió un error al generar el Excel.', 'red');
  }
}
