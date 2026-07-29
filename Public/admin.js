let currentDB = { aarti: [], purnima: [], events: [], gallery: [] };

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('mandir_admin_token');
  if (token) {
    showDashboard();
  }

  document.getElementById('admin-login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('aarti-form').addEventListener('submit', handleAddAarti);
  document.getElementById('purnima-form').addEventListener('submit', handleAddPurnima);
  document.getElementById('events-form').addEventListener('submit', handleAddEvent);
  document.getElementById('upload-form').addEventListener('submit', handleUploadPhoto);
});

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();
  if (result.success) {
    localStorage.setItem('mandir_admin_token', result.token);
    showDashboard();
  } else {
    alert(result.message || 'Login failed');
  }
}

function handleLogout() {
  localStorage.removeItem('mandir_admin_token');
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('dashboard-section').style.display = 'none';
}

async function showDashboard() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  await refreshAdminData();
}

async function refreshAdminData() {
  const res = await fetch('/api/data');
  currentDB = await res.json();
  renderAdminTables();
}

function renderAdminTables() {
  // Render Aarti
  const aartiTbody = document.getElementById('admin-aarti-list');
  aartiTbody.innerHTML = (currentDB.aarti || []).map((item, index) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.time}</td>
      <td>${item.details || ''}</td>
      <td><button class="btn btn-danger" onclick="deleteAarti(${index})">Delete</button></td>
    </tr>
  `).join('');

  // Render Purnima
  const purnimaTbody = document.getElementById('admin-purnima-list');
  purnimaTbody.innerHTML = (currentDB.purnima || []).map((item, index) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.date}</td>
      <td>${item.note || ''}</td>
      <td><button class="btn btn-danger" onclick="deletePurnima(${index})">Delete</button></td>
    </tr>
  `).join('');

  // Render Events
  const eventsTbody = document.getElementById('admin-events-list');
  eventsTbody.innerHTML = (currentDB.events || []).map((item, index) => `
    <tr>
      <td>${item.title}</td>
      <td>${item.date}</td>
      <td>${item.description}</td>
      <td><button class="btn btn-danger" onclick="deleteEvent(${index})">Delete</button></td>
    </tr>
  `).join('');

  // Render Gallery
  const galleryDiv = document.getElementById('admin-gallery-list');
  galleryDiv.innerHTML = (currentDB.gallery || []).map(src => `
    <div style="text-align: center;">
      <img src="${src}" class="gallery-img">
      <button class="btn btn-danger" style="margin-top: 5px; width:100%;" onclick="deletePhoto('${src}')">Delete</button>
    </div>
  `).join('');
}

async function handleAddAarti(e) {
  e.preventDefault();
  const name = document.getElementById('aarti-name').value;
  const time = document.getElementById('aarti-time').value;
  const details = document.getElementById('aarti-details').value;

  currentDB.aarti.push({ name, time, details });
  await saveAartiAPI();
  document.getElementById('aarti-form').reset();
}

async function deleteAarti(index) {
  currentDB.aarti.splice(index, 1);
  await saveAartiAPI();
}

async function saveAartiAPI() {
  await fetch('/api/admin/aarti', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aarti: currentDB.aarti })
  });
  refreshAdminData();
}

async function handleAddPurnima(e) {
  e.preventDefault();
  const name = document.getElementById('purnima-name').value;
  const date = document.getElementById('purnima-date').value;
  const note = document.getElementById('purnima-note').value;

  currentDB.purnima.push({ name, date, note });
  await fetch('/api/admin/purnima', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purnima: currentDB.purnima })
  });
  document.getElementById('purnima-form').reset();
  refreshAdminData();
}

async function deletePurnima(index) {
  currentDB.purnima.splice(index, 1);
  await fetch('/api/admin/purnima', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purnima: currentDB.purnima })
  });
  refreshAdminData();
}

async function handleAddEvent(e) {
  e.preventDefault();
  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const description = document.getElementById('event-desc').value;

  currentDB.events.push({ title, date, description });
  await fetch('/api/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: currentDB.events })
  });
  document.getElementById('events-form').reset();
  refreshAdminData();
}

async function deleteEvent(index) {
  currentDB.events.splice(index, 1);
  await fetch('/api/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: currentDB.events })
  });
  refreshAdminData();
}

async function handleUploadPhoto(e) {
  e.preventDefault();
  const fileInput = document.getElementById('photo-file');
  if (!fileInput.files[0]) return;

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  await fetch('/api/admin/upload', {
    method: 'POST',
    body: formData
  });

  document.getElementById('upload-form').reset();
  refreshAdminData();
}

async function deletePhoto(photoUrl) {
  await fetch('/api/admin/delete-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoUrl })
  });
  refreshAdminData();
}
