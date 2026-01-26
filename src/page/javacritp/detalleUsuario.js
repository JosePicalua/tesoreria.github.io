let data = [];
let editingIndex = -1;
const CSV_PATH = 'plantillaSeguimiento/detallesUsuario.csv';

// Cargar CSV automáticamente
async function loadCSVData() {
    try {
        // Primero intentar cargar desde localStorage
        const savedData = localStorage.getItem('csvData');
        if (savedData) {
            data = JSON.parse(savedData);
            renderTable();
            showMessage('✅ Datos cargados desde memoria: ' + data.length + ' registros', 'success');
            return;
        }

        // Si no hay datos en localStorage, cargar desde CSV
        const response = await fetch(CSV_PATH);
        if (!response.ok) {
            throw new Error('No se pudo cargar el CSV');
        }
        
        const text = await response.text();
        const rows = text.split('\n').filter(row => row.trim());
        
        if (rows.length <= 1) {
            data = [];
            renderTable();
            showMessage('📄 CSV vacío - Listo para agregar registros', 'success');
            return;
        }

        const headers = rows[0].split(',').map(h => h.trim());
        
        const loadedData = [];
        for (let i = 1; i < rows.length; i++) {
            const values = parseCSVLine(rows[i]);
            
            const rowData = {
                nombreTitular: values[0] || '',
                numeroDocumento: values[1] || '',
                numeroInmobiliaria: values[2] || '',
                direccionPropiedad: values[3] || '',
                totalEndeudamiento: values[4] || '',
                oficioResolucionPersuacion: values[5] || '',
                fechaOficioResolucionPersuacion: values[6] || '',
                resolucioncOCTributario: values[7] || '',
                resolucionOTMIPUMP: values[8] || '',
                resolucionMedidaCautera: values[9] || '',
                resolucionEmbargo: values[10] || '',
                fechaResolucionCOCTributario: values[11] || '',
                fechaResolucionOTMIPUMP: values[12] || '',
                fechaResolucionMedidaCautera: values[13] || '',
                fechaResolucionEmbargo: values[14] || '',
                observaciones: values[15] || ''
            };
            loadedData.push(rowData);
        }

        data = loadedData;
        // Guardar en localStorage
        localStorage.setItem('csvData', JSON.stringify(data));
        renderTable();
        showMessage('✅ CSV cargado: ' + data.length + ' registros', 'success');
        
    } catch (error) {
        console.error('Error al cargar CSV:', error);
        data = [];
        renderTable();
        showMessage('⚠️ No se pudo cargar el CSV', 'error');
    }
}

// Parser CSV
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result;
}

// Guardar en localStorage (actualización interna)
function saveDataInternally() {
    try {
        localStorage.setItem('csvData', JSON.stringify(data));
        showMessage('💾 Datos actualizados automáticamente', 'success');
    } catch (error) {
        console.error('Error al guardar:', error);
        showMessage('❌ Error al guardar', 'error');
    }
}

// Exportar a CSV cuando el usuario lo necesite
function exportToCSV() {
    try {
        const headers = [
            'nombreTitular',
            'numeroDocumento',
            'numeroInmobiliaria',
            'direccionPropiedad',
            'totalEndeudamiento',
            'oficioResolucionPersuacion',
            'fechaOficioResolucionPersuacion',
            'resolucioncOCTributario',
            'resolucionOTMIPUMP',
            'resolucionMedidaCautera',
            'resolucionEmbargo',
            'fechaResolucionCOCTributario',
            'fechaResolucionOTMIPUMP',
            'fechaResolucionMedidaCautera',
            'fechaResolucionEmbargo',
            'observaciones'
        ];
        
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = String(row[header] || '');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'detallesUsuario.csv';
        link.click();
        
        showMessage('📥 CSV exportado - Copia a plantillaSeguimiento/', 'success');
        
    } catch (error) {
        console.error('Error al exportar:', error);
        showMessage('❌ Error al exportar', 'error');
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (msg) {
        msg.textContent = text;
        msg.className = 'message ' + type;
        msg.style.display = 'block';
        setTimeout(() => {
            msg.style.display = 'none';
        }, 5000);
    }
}

const basicForm = document.getElementById('basicForm');
if (basicForm) {
    basicForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nombreTitular: document.getElementById('nombreTitular').value,
            numeroDocumento: document.getElementById('numeroDocumento').value,
            numeroInmobiliaria: document.getElementById('numeroInmobiliaria').value,
            direccionPropiedad: document.getElementById('direccionPropiedad').value,
            totalEndeudamiento: document.getElementById('totalEndeudamiento').value,
            oficioResolucionPersuacion: document.getElementById('oficioResolucionPersuacion').value,
            fechaOficioResolucionPersuacion: document.getElementById('fechaOficioResolucionPersuacion').value,
            resolucioncOCTributario: '',
            resolucionOTMIPUMP: '',
            resolucionMedidaCautera: '',
            resolucionEmbargo: '',
            fechaResolucionCOCTributario: '',
            fechaResolucionOTMIPUMP: '',
            fechaResolucionMedidaCautera: '',
            fechaResolucionEmbargo: '',
            observaciones: ''
        };

        data.push(formData);
        saveDataInternally();
        clearBasicForm();
        renderTable();
        showMessage('✅ Registro agregado', 'success');
    });
}

function clearBasicForm() {
    const form = document.getElementById('basicForm');
    if (form) {
        form.reset();
    }
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const tableSection = document.querySelector('.table-section');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (data.length === 0) {
        if (tableSection) {
            tableSection.style.display = 'none';
        }
        return;
    }

    if (tableSection) {
        tableSection.style.display = 'block';
    }

    data.forEach((row, index) => {
        const isComplete = row.resolucioncOCTributario || row.resolucionOTMIPUMP || 
                          row.resolucionMedidaCautera || row.resolucionEmbargo;
        
        const tr = document.createElement('tr');
        tr.className = isComplete ? 'status-complete' : 'status-incomplete';
        tr.innerHTML = `
            <td>
                ${isComplete ? 
                    '<span class="badge badge-success">✓ Completo</span>' : 
                    '<span class="badge badge-warning">⚠ Básico</span>'}
            </td>
            <td><strong>${row.nombreTitular}</strong></td>
            <td>${row.numeroDocumento}</td>
            <td>${row.numeroInmobiliaria || '-'}</td>
            <td>${row.direccionPropiedad || '-'}</td>
            <td>${row.totalEndeudamiento ? '$' + parseFloat(row.totalEndeudamiento).toLocaleString() : '-'}</td>
            <td>${row.oficioResolucionPersuacion || '-'}</td>
            <td>${row.fechaOficioResolucionPersuacion || '-'}</td>
            <td>${row.resolucioncOCTributario ? '✓' : '-'}</td>
            <td>${row.resolucionOTMIPUMP ? '✓' : '-'}</td>
            <td>${row.resolucionMedidaCautera ? '✓' : '-'}</td>
            <td>${row.resolucionEmbargo ? '✓' : '-'}</td>
            <td>
                <button class="btn-complete" onclick="completeData(${index})">➕ Completar</button>
                <button class="btn-delete" onclick="deleteRow(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function completeData(index) {
    editingIndex = index;
    const row = data[index];

    const modal = document.getElementById('completeModal');
    if (!modal) {
        showMessage('⚠️ Error: Modal no encontrado', 'error');
        return;
    }

    const fields = [
        { input: 'modal_resolucioncOCTributario', value: row.resolucioncOCTributario },
        { input: 'modal_fechaResolucionCOCTributario', value: row.fechaResolucionCOCTributario },
        { input: 'modal_resolucionOTMIPUMP', value: row.resolucionOTMIPUMP },
        { input: 'modal_fechaResolucionOTMIPUMP', value: row.fechaResolucionOTMIPUMP },
        { input: 'modal_resolucionMedidaCautera', value: row.resolucionMedidaCautera },
        { input: 'modal_fechaResolucionMedidaCautera', value: row.fechaResolucionMedidaCautera },
        { input: 'modal_resolucionEmbargo', value: row.resolucionEmbargo },
        { input: 'modal_fechaResolucionEmbargo', value: row.fechaResolucionEmbargo },
        { input: 'modal_observaciones', value: row.observaciones }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.input);
        if (input) {
            input.value = field.value || '';
            
            if (field.value && field.value.trim() !== '') {
                input.readOnly = true;
                input.style.background = '#e9ecef';
                input.style.cursor = 'not-allowed';
            } else {
                input.readOnly = false;
                input.style.background = 'white';
                input.style.cursor = 'text';
            }
        }
    });

    modal.style.display = 'block';
}

const completeForm = document.getElementById('completeForm');
if (completeForm) {
    completeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (editingIndex >= 0) {
            data[editingIndex].resolucioncOCTributario = document.getElementById('modal_resolucioncOCTributario').value;
            data[editingIndex].fechaResolucionCOCTributario = document.getElementById('modal_fechaResolucionCOCTributario').value;
            data[editingIndex].resolucionOTMIPUMP = document.getElementById('modal_resolucionOTMIPUMP').value;
            data[editingIndex].fechaResolucionOTMIPUMP = document.getElementById('modal_fechaResolucionOTMIPUMP').value;
            data[editingIndex].resolucionMedidaCautera = document.getElementById('modal_resolucionMedidaCautera').value;
            data[editingIndex].fechaResolucionMedidaCautera = document.getElementById('modal_fechaResolucionMedidaCautera').value;
            data[editingIndex].resolucionEmbargo = document.getElementById('modal_resolucionEmbargo').value;
            data[editingIndex].fechaResolucionEmbargo = document.getElementById('modal_fechaResolucionEmbargo').value;
            data[editingIndex].observaciones = document.getElementById('modal_observaciones').value;

            saveDataInternally();
            renderTable();
            closeModal();
            showMessage('✅ Información actualizada', 'success');
        }
    });
}

function closeModal() {
    const modal = document.getElementById('completeModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingIndex = -1;
}

function deleteRow(index) {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
        data.splice(index, 1);
        saveDataInternally();
        renderTable();
        showMessage('🗑️ Registro eliminado', 'success');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('completeModal');
    if (event.target == modal) {
        closeModal();
    }
}

async function toggleApp() {
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleMainBtn');

    if (mainContent && toggleBtn) {
        if (mainContent.style.display === "none") {
            await loadCSVData();
            
            mainContent.style.display = "block";
            toggleBtn.innerHTML = "👁️ Ocultar Tabla y Formulario";
            toggleBtn.classList.replace('btn-primary', 'btn-secondary');
        } else {
            mainContent.style.display = "none";
            toggleBtn.innerHTML = "➕ Agregar Titular";
            toggleBtn.classList.replace('btn-secondary', 'btn-primary');
        }
    }
}