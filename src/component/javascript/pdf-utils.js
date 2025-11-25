// ============================================
// FUNCIONES COMPARTIDAS PARA GENERACIÓN DE PDFs
// Archivo: pdf-utils.js
// ============================================

// Procesar texto con etiquetas <b>
function procesarTextoConNegritas(texto) {
    const partes = [];
    const regex = /<b>(.*?)<\/b>/g;
    let ultimoIndice = 0;
    let match;
    
    while ((match = regex.exec(texto)) !== null) {
        if (match.index > ultimoIndice) {
            partes.push({ t: texto.substring(ultimoIndice, match.index), b: false });
        }
        partes.push({ t: match[1], b: true });
        ultimoIndice = regex.lastIndex;
    }
    
    if (ultimoIndice < texto.length) {
        partes.push({ t: texto.substring(ultimoIndice), b: false });
    }
    
    return partes.length > 0 ? partes : [{ t: texto, b: false }];
}

// Dividir palabra larga con guiones
function dividirPalabra(palabra, doc, maxWidth) {
    const partes = [];
    let parteActual = '';
    
    for (let i = 0; i < palabra.length; i++) {
        const caracter = palabra[i];
        const pruebaParte = parteActual + caracter;
        const anchoParte = doc.getTextWidth(pruebaParte + '-');
        
        if (anchoParte <= maxWidth) {
            parteActual = pruebaParte;
        } else {
            if (parteActual.length > 0) {
                partes.push(parteActual + '-');
                parteActual = caracter;
            } else {
                partes.push(pruebaParte + '-');
                parteActual = '';
            }
        }
    }
    
    if (parteActual) {
        partes.push(parteActual);
    }
    
    return partes;
}

// Justificar una línea de texto (distribuir espacios)
function justificarLinea(doc, texto, x, y, maxWidth) {
    const palabras = texto.split(' ');
    if (palabras.length <= 1) {
        doc.text(texto, x, y);
        return;
    }
    
    const anchoTexto = doc.getTextWidth(texto);
    const espacioTotal = maxWidth - anchoTexto;
    const espacioEntrePalabras = espacioTotal / (palabras.length - 1);
    
    let xActual = x;
    for (let i = 0; i < palabras.length; i++) {
        doc.text(palabras[i], xActual, y);
        xActual += doc.getTextWidth(palabras[i] + ' ') + espacioEntrePalabras;
    }
}

// Justificar texto completo (divide en líneas y justifica)
function justificarTexto(texto, maxWidth, doc) {
    const palabras = texto.split(' ');
    let lineas = [];
    let lineaActual = '';
    
    for (let i = 0; i < palabras.length; i++) {
        const palabra = palabras[i];
        const pruebaLinea = lineaActual + (lineaActual ? ' ' : '') + palabra;
        const anchoLinea = doc.getTextWidth(pruebaLinea);
        
        if (anchoLinea <= maxWidth) {
            lineaActual = pruebaLinea;
        } else {
            if (doc.getTextWidth(palabra) > maxWidth) {
                if (lineaActual) {
                    lineas.push(lineaActual);
                    lineaActual = '';
                }
                const partesPalabra = dividirPalabra(palabra, doc, maxWidth);
                for (let j = 0; j < partesPalabra.length; j++) {
                    if (j === partesPalabra.length - 1) {
                        lineaActual = partesPalabra[j];
                    } else {
                        lineas.push(partesPalabra[j]);
                    }
                }
            } else {
                lineas.push(lineaActual);
                lineaActual = palabra;
            }
        }
    }
    
    if (lineaActual) {
        lineas.push(lineaActual);
    }
    
    return lineas;
}

// Renderizar línea justificada (usada por Citación)
function renderizarLineaJustificada(linea, x, y, maxWidth, doc, esUltima) {
    if (esUltima) {
        doc.text(linea, x, y);
    } else {
        justificarLinea(doc, linea, x, y, maxWidth);
    }
}

// Verificar espacio y saltar página si es necesario
function verificarYSaltarPagina(doc, y, lineHeight, numLineasNecesarias, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom) {
    const espacioNecesario = lineHeight * numLineasNecesarias;
    if (y + espacioNecesario > pageHeight - marginBottom) {
        doc.addPage();
        if (marcaDeAgua) {
            doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, '', 'NONE', 0.15);
        }
        return marginTop;
    }
    return y;
}

// Agregar texto justificado simple (sin negritas)
function agregarTextoJustificado(doc, texto, x, y, maxWidth, lineHeight, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom) {
    const palabras = texto.split(' ');
    let lineas = [];
    let lineaActual = '';
    
    for (let i = 0; i < palabras.length; i++) {
        const palabra = palabras[i];
        const pruebaLinea = lineaActual + (lineaActual ? ' ' : '') + palabra;
        const anchoLinea = doc.getTextWidth(pruebaLinea);
        
        if (anchoLinea <= maxWidth) {
            lineaActual = pruebaLinea;
        } else {
            if (doc.getTextWidth(palabra) > maxWidth) {
                if (lineaActual) {
                    lineas.push(lineaActual);
                    lineaActual = '';
                }
                const partesPalabra = dividirPalabra(palabra, doc, maxWidth);
                for (let j = 0; j < partesPalabra.length; j++) {
                    if (j === partesPalabra.length - 1) {
                        lineaActual = partesPalabra[j];
                    } else {
                        lineas.push(partesPalabra[j]);
                    }
                }
            } else {
                lineas.push(lineaActual);
                lineaActual = palabra;
            }
        }
    }
    
    if (lineaActual) {
        lineas.push(lineaActual);
    }
    
    for (let i = 0; i < lineas.length; i++) {
        y = verificarYSaltarPagina(doc, y, lineHeight, 1, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
        
        const linea = lineas[i];
        
        if (i === lineas.length - 1) {
            doc.text(linea, x, y);
        } else {
            justificarLinea(doc, linea, x, y, maxWidth);
        }
        y += lineHeight;
    }
    
    return y;
}

// Agregar texto con negritas justificado
function agregarTextoConNegritas(doc, partes, x, y, maxWidth, lineHeight, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom) {
    let palabrasConEstilo = [];
    
    for (let parte of partes) {
        const palabrasDeParte = parte.t.split(' ').filter(p => p.length > 0);
        for (let palabra of palabrasDeParte) {
            palabrasConEstilo.push({ texto: palabra, bold: parte.b });
        }
    }
    
    let lineas = [];
    let lineaActual = [];
    let anchoActual = 0;
    
    for (let i = 0; i < palabrasConEstilo.length; i++) {
        const item = palabrasConEstilo[i];
        doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
        const anchoPalabra = doc.getTextWidth(item.texto);
        const anchoEspacio = doc.getTextWidth(' ');
        const anchoTotal = anchoPalabra + (lineaActual.length > 0 ? anchoEspacio : 0);
        
        if (anchoActual + anchoTotal <= maxWidth) {
            lineaActual.push(item);
            anchoActual += anchoTotal;
        } else {
            if (lineaActual.length > 0) {
                lineas.push(lineaActual);
            }
            lineaActual = [item];
            anchoActual = anchoPalabra;
        }
    }
    
    if (lineaActual.length > 0) {
        lineas.push(lineaActual);
    }
    
    for (let i = 0; i < lineas.length; i++) {
        y = verificarYSaltarPagina(doc, y, lineHeight, 1, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
        
        const linea = lineas[i];
        const esUltimaLinea = (i === lineas.length - 1);
        
        if (!esUltimaLinea && linea.length > 1) {
            let anchoTotal = 0;
            for (let item of linea) {
                doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                anchoTotal += doc.getTextWidth(item.texto);
            }
            
            const espacioDisponible = maxWidth - anchoTotal;
            const espacioEntrePalabras = espacioDisponible / (linea.length - 1);
            
            let xActual = x;
            for (let j = 0; j < linea.length; j++) {
                const item = linea[j];
                doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                doc.text(item.texto, xActual, y);
                xActual += doc.getTextWidth(item.texto) + espacioEntrePalabras;
            }
        } else {
            let xActual = x;
            for (let item of linea) {
                doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                doc.text(item.texto, xActual, y);
                xActual += doc.getTextWidth(item.texto + ' ');
            }
        }
        
        y += lineHeight;
    }
    
    return y;
}

// Agregar texto con etiquetas <b> (wrapper simplificado)
function agregarTextoConEtiquetas(doc, texto, x, y, maxWidth, lineHeight, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom) {
    const partes = procesarTextoConNegritas(texto);
    return agregarTextoConNegritas(doc, partes, x, y, maxWidth, lineHeight, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
}