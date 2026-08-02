const fs = require('node:fs');
const path = require('node:path');
const htmlToDocx = require('html-to-docx');
const { marked } = require('marked');

async function buildManual() {
  const imagesDir = path.join(__dirname, '../docs/images');
  const docsDir = path.join(__dirname, '../docs');
  
  if (!fs.existsSync(imagesDir)) {
    console.warn('La carpeta docs/images no existe. No se generará el manual.');
    return;
  }

  console.log('Construyendo manual de usuario en Markdown...');
  const mdContent = `
# Manual de Usuario - QAMS
**Quality Assurance Management System**

Este documento es una guía automatizada del flujo principal del sistema.

## 1. Inicio de Sesión
Para acceder al sistema, el usuario debe ingresar sus credenciales en la pantalla principal.

![Login](images/01_login.png)

Una vez ingresados los datos (usuario y contraseña), se habilita el botón de acceso.

![Credenciales](images/02_login_credentials.png)

## 2. Tablero de Control (Dashboard)
Después de un inicio de sesión exitoso, el usuario es redirigido al Dashboard, donde se muestran métricas y gráficas clave.

![Dashboard](images/03_dashboard.png)

## 3. Gestión de Proyectos
El módulo de proyectos permite administrar las iniciativas de QA. La vista principal lista todos los proyectos activos.

![Proyectos Lista](images/04_projects_list.png)

Al presionar el botón "Nuevo Proyecto", se abre un formulario para detallar el nombre y la descripción.

![Proyectos Formulario](images/05_projects_form.png)

Después de guardarlo, el proyecto se muestra en la tabla y está disponible para iniciar sus pruebas.

![Proyectos Guardados](images/06_projects_saved.png)

## 4. Requisitos del Sistema
Esta pantalla permite gestionar la matriz de trazabilidad y añadir requerimientos funcionales, de seguridad, rendimiento, entre otros.

![Requisitos](images/07_requirements_list.png)

## 5. Diseño de Casos de Prueba
El módulo permite escribir casos de prueba paso a paso.

![Casos de Prueba Lista](images/08_testcases_list.png)

Formulario de creación de un caso:

![Caso Formulario](images/09_testcases_form.png)

## 6. Ejecución de Pruebas
Permite asentar los resultados (Passed, Failed, Blocked) y registrar tiempos.

![Ejecuciones](images/10_executions_list.png)

## 7. Seguimiento de Defectos (Bugs)
Los testers pueden reportar incidentes con sus respectivos pasos a reproducir.

![Defectos](images/11_defects_list.png)

## 8. Reportes y Quality Gates
El sistema genera resúmenes ejecutivos y verifica de forma automática si un proyecto cumple los umbrales (Quality Gates) para ser certificado.

![Reportes](images/12_reports.png)
`;

  fs.writeFileSync(path.join(docsDir, 'user_manual.md'), mdContent, 'utf-8');
  console.log('Archivo user_manual.md generado con éxito.');

  console.log('Convirtiendo Markdown a HTML y luego a DOCX...');
  
  // Convertir MD a HTML (con paths absolutos o embebidos para imágenes)
  // Reemplazar "images/" con rutas absolutas para que docx las procese
  const htmlContent = await marked.parse(mdContent);
  
  // Convert images to base64 for docx compatibility
  let finalHtml = htmlContent;
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  while ((match = imgRegex.exec(finalHtml)) !== null) {
    const imgSrc = match[1];
    const imagePath = path.join(__dirname, '../docs', imgSrc);
    if (fs.existsSync(imagePath)) {
      const ext = path.extname(imagePath).replace('.', '');
      const base64 = fs.readFileSync(imagePath).toString('base64');
      const base64Src = `data:image/${ext};base64,${base64}`;
      finalHtml = finalHtml.replace(imgSrc, base64Src);
    }
  }

  const documentHtml = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Manual de Usuario QAMS</title></head>
      <body>${finalHtml}</body>
    </html>
  `;

  try {
    const docxBuffer = await htmlToDocx(documentHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    const docxPath = path.join(docsDir, 'Manual_Usuario_QAMS.docx');
    fs.writeFileSync(docxPath, docxBuffer);
    console.log('Archivo Manual_Usuario_QAMS.docx generado con éxito.');
  } catch (error) {
    console.error('Error al generar DOCX:', error.message);
  }
}

buildManual();
