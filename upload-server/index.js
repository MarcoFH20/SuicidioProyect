const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Crea carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configura multer para almacenar localmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// Ruta para subir imagen
app.post('/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }

  // Construir URL pública
  const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;

  res.json({ url: imageUrl });
});

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(uploadsDir));

app.listen(port, () => {
  console.log(`🚀 Servidor de subida corriendo en http://localhost:${port}`);
});
