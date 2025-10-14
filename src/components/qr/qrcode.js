// URL base, sin el parámetro del equipo.
const baseURL = "http://192.168.1.114:3000/index.html";
let qr = null; // Variable para almacenar la instancia del QR

function generateQRCode() {
    const equipoNameInput = document.getElementById("equipoName");
    const equipoName = equipoNameInput.value.trim();
    const qrContainer = document.getElementById("qrcode");
    const urlMessage = document.getElementById("generatedUrlMessage");

    if (equipoName === "") {
    alert("Por favor, introduce el nombre del equipo.");
    equipoNameInput.focus();
    return;
    }

    // 1. Construir el link completo con el parámetro 'equipo'
    const finalURL = `${baseURL}?equipo=${encodeURIComponent(equipoName)}`;

    // 2. Limpiar el contenedor del QR anterior
    qrContainer.innerHTML = "";
    
    // 3. (Re)crear la instancia del código QR
    if (qr === null) {
    qr = new QRCode(qrContainer, {
        text: finalURL, 
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    } else {
    // Si ya existe, solo actualiza el texto
    qr.makeCode(finalURL);
    }
    
    // 4. Mostrar el link generado para verificación
    urlMessage.textContent = `Link Generado: ${finalURL}`;
    document.getElementById('downloadBton').style.display = 'inline-block';
}

// Botón para imprimir el QR
document.getElementById('downloadBton').addEventListener('click', () => {
  const qrElement = document.getElementById('qrcode').querySelector('img');

  if (!qrElement) {
    alert("Primero genera el código QR.");
    return;
  }

  // Crear una nueva ventana para impresión
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir Código QR</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <img src="${qrElement.src}" width="256" height="256" />
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  // Espera un poco para que cargue la imagen antes de imprimir
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
});
