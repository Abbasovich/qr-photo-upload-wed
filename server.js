const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/upload.html'));
});

app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).send('Dosya yüklenemedi.');
  res.send('<h2>Teşekkürler! Fotoğraf yüklendi.</h2><a href="/">Geri dön</a>');
});

app.get('/gallery', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) return res.send('Galeri okunamıyor.');
    const images = files.map(file => `<img src="/uploads/${file}" style="width:200px;margin:10px">`).join('');
    res.send(`<h1>Yüklenen Fotoğraflar</h1>${images}<br><a href="/">Fotoğraf Yükle</a>`);
  });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT} adresinde çalışıyor`));