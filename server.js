const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static(uploadFolder));

// Çoklu dosya yükleme
app.post('/upload', upload.array('photos[]', 20), (req, res) => {
  if (!req.files || req.files.length === 0) return res.json({ success: false, message: 'Dosya yüklenmedi' });
  res.json({ success: true, files: req.files.map(f => f.filename) });
});

// Galeri dosyalarını listele
app.get('/gallery', (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) return res.status(500).json({ success: false, message: 'Dosyalar okunamadı' });
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    res.json({ success: true, images });
  });
});

// Fotoğraf silme
app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(uploadFolder, req.params.filename);
  fs.unlink(filePath, err => {
    if (err) return res.status(404).json({ success: false, message: 'Dosya bulunamadı' });
    res.json({ success: true, message: 'Dosya silindi' });
  });
});

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
