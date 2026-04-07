const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

const DATA_FILE = path.join(__dirname, 'data.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// --- Helpers ---
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function readConfig() {
  const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// --- Config routes ---
app.get('/api/config', (req, res) => {
  const config = readConfig();
  // Never send the password to the client
  res.json({ membres: config.membres });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const config = readConfig();
  if (password === config.adminPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
  }
});

app.put('/api/config/membres', (req, res) => {
  const { password, membres } = req.body;
  const config = readConfig();
  if (password !== config.adminPassword) {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  if (!Array.isArray(membres) || membres.length === 0) {
    return res.status(400).json({ message: 'Liste de membres invalide' });
  }
  config.membres = membres;
  writeConfig(config);
  res.json({ membres: config.membres });
});

// --- Reservations routes ---
app.get('/api/reservations', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/reservations', (req, res) => {
  const { membre, debut, fin, statut, note } = req.body;
  if (!membre || !debut || !fin || !statut) {
    return res.status(400).json({ message: 'Champs obligatoires manquants' });
  }
  if (!['option', 'confirme'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }
  if (new Date(debut) > new Date(fin)) {
    return res.status(400).json({ message: 'La date de début doit être avant la date de fin' });
  }

  const reservation = {
    id: uuidv4(),
    membre,
    debut,
    fin,
    statut,
    note: note || '',
    createdAt: new Date().toISOString()
  };

  const data = readData();
  data.push(reservation);
  writeData(data);
  res.status(201).json(reservation);
});

app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { membre, debut, fin, statut, note, password, currentUser } = req.body;
  const config = readConfig();

  const data = readData();
  const index = data.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Réservation introuvable' });
  }

  const reservation = data[index];
  const isAdmin = password === config.adminPassword;
  const isOwner = reservation.membre === currentUser;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres réservations' });
  }

  if (statut && !['option', 'confirme'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  const d = debut || reservation.debut;
  const f = fin || reservation.fin;
  if (new Date(d) > new Date(f)) {
    return res.status(400).json({ message: 'La date de début doit être avant la date de fin' });
  }

  data[index] = {
    ...reservation,
    membre: membre || reservation.membre,
    debut: d,
    fin: f,
    statut: statut || reservation.statut,
    note: note !== undefined ? note : reservation.note
  };

  writeData(data);
  res.json(data[index]);
});

app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { password, currentUser } = req.body;
  const config = readConfig();

  const data = readData();
  const index = data.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Réservation introuvable' });
  }

  const reservation = data[index];
  const isAdmin = password === config.adminPassword;
  const isOwner = reservation.membre === currentUser;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres réservations' });
  }

  data.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

// Admin: delete all past reservations
app.delete('/api/admin/reservations/past', (req, res) => {
  const { password } = req.body;
  const config = readConfig();
  if (password !== config.adminPassword) {
    return res.status(403).json({ message: 'Non autorisé' });
  }

  const today = new Date().toISOString().split('T')[0];
  const data = readData();
  const filtered = data.filter(r => r.fin >= today);
  writeData(filtered);
  res.json({ deleted: data.length - filtered.length });
});

// Fallback to React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Serveur en marche. Lancez "npm run build" pour construire le frontend.');
  }
});

app.listen(PORT, () => {
  console.log(`✓ Serveur démarré sur http://localhost:${PORT}`);
});
