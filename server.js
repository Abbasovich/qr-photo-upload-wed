const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Yüklənən fotolar burada saxlanacaq
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer konfiqurasiyası: çoxlu fayl yükləmək üçün
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));  // Yüklənən şəkilləri göstərmək üçün

// Frontend əsas səhifə
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Çoxlu fayl yükləmə endpointi
app.post('/upload', upload.array('photos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Fayl tapılmadı' });
  }
  res.json({ success: true, message: 'Fayllar uğurla yükləndi!' });
});

// Yüklənən faylların siyahısını qaytarmaq üçün endpoint
app.get('/photos', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ success: false, message: 'Fayllar oxunmadı' });
    res.json({ success: true, files });
  });
});

// Foto silmə üçün endpoint
app.delete('/photos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Foto silinə bilmədi' });
    res.json({ success: true, message: 'Foto silindi' });
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir`);
});

