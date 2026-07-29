document.addEventListener('DOMContentLoaded', loadPublicData);

async function loadPublicData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();

    // Render Aarti Timings
    const aartiContainer = document.getElementById('aarti-container');
    if (aartiContainer) {
      if (data.aarti && data.aarti.length > 0) {
        aartiContainer.innerHTML = data.aarti.map(item => `
          <div class="aarti-card">
            <h3>${item.name}</h3>
            <div class="aarti-time">⏰ ${item.time}</div>
            <p>${item.details || ''}</p>
          </div>
        `).join('');
      } else {
        aartiContainer.innerHTML = '<p>No Aarti schedules updated yet.</p>';
      }
    }

    // Render Purnima Dates
    const purnimaContainer = document.getElementById('purnima-container');
    if (purnimaContainer) {
      if (data.purnima && data.purnima.length > 0) {
        purnimaContainer.innerHTML = data.purnima.map(item => `
          <li class="purnima-item">
            <strong>${item.name} (${item.date}):</strong> ${item.note || ''}
          </li>
        `).join('');
      } else {
        purnimaContainer.innerHTML = '<p>No upcoming Purnima dates added yet.</p>';
      }
    }

    // Render Events & Notes
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
      if (data.events && data.events.length > 0) {
        eventsContainer.innerHTML = data.events.map(item => `
          <div class="event-item">
            <h3>${item.title} <span style="font-size:0.85rem; font-weight:normal; color:#666;">(${item.date})</span></h3>
            <p>${item.description}</p>
          </div>
        `).join('');
      } else {
        eventsContainer.innerHTML = '<p>No active temple notes or upcoming events.</p>';
      }
    }

    // Render Gallery
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
      if (data.gallery && data.gallery.length > 0) {
        galleryContainer.innerHTML = data.gallery.map(src => `
          <img src="${src}" alt="Ranchhodji Mandir Darshan" class="gallery-img">
        `).join('');
      } else {
        galleryContainer.innerHTML = '<p>No photos uploaded to the gallery yet.</p>';
      }
    }

  } catch (err) {
    console.error('Error fetching temple data:', err);
  }
}
