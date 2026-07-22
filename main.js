// Wingfoil Euskadi - Main JS file containing interactive components

document.addEventListener('DOMContentLoaded', () => {
  initCommon();
  initWeather();
  initSpotsMap();
  initFAQ();
  initWizard();
  initCatalog();
  initContact();
});

// ==========================================
// COMMON ACTIONS (Header scroll & Mobile Nav)
// ==========================================
function initCommon() {
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
      
      // Transform hamburger to X
      const spans = hamburger.querySelectorAll('span');
      if (nav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu when clicking links
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }
}

// ==========================================
// WEATHER — OPEN-METEO LIVE API (index.html)
// Coordenadas: Escuela Wingfoil Euskadi, Ullibarri-Gamboa
// lat: 42.9062, lon: -2.5449
// ==========================================
function initWeather() {
  const btnRefresh = document.getElementById('btn-refresh');
  if (!btnRefresh) return;

  const LAT = 42.9062;
  const LON = -2.5449;

  // Open-Meteo API — datos actuales + previsión 5 días en nudos
  const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&daily=wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,temperature_2m_max,temperature_2m_min` +
    `&wind_speed_unit=kn&timezone=Europe%2FMadrid&forecast_days=5`;

  // Converts wind degrees to compass label
  function degreesToCompass(deg) {
    const dirs = ['Norte (N)', 'NNE', 'Noreste (NE)', 'ENE', 'Este (E)', 'ESE', 'Sureste (SE)', 'SSE',
                  'Sur (S)', 'SSO', 'Suroeste (SO)', 'OSO', 'Oeste (O)', 'ONO', 'Noroeste (NO)', 'NNO'];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  // Short compass arrow for forecast strip
  function degreesToArrow(deg) {
    const arrows = ['↓','↙','←','↖','↑','↗','→','↘'];
    return arrows[Math.round(deg / 45) % 8];
  }

  // Evaluates wingfoil conditions by wind speed (knots)
  function evaluateConditions(windKts, gustKts) {
    if (windKts < 8) {
      return { cls: 'status-caution', icon: '🟡', text: 'Viento flojo. No apto para wingfoil. Ideal para SUP y remo.' };
    } else if (windKts >= 8 && windKts <= 12) {
      return { cls: 'status-caution', icon: '🟡', text: `Brisa ligera (${Math.round(windKts)} kts). Condiciones iniciales, mejor con alas grandes (4-5m).` };
    } else if (windKts > 12 && windKts <= 25 && gustKts <= 32) {
      return { cls: 'status-optimal', icon: '🟢', text: `¡Condiciones óptimas para wingfoil! (${Math.round(windKts)} kts). Todos los niveles pueden navegar.` };
    } else if (windKts > 25 && windKts <= 32) {
      return { cls: 'status-caution', icon: '🟠', text: `Viento fuerte (${Math.round(windKts)} kts). Solo para riders avanzados. Consultar con instructor.` };
    } else {
      return { cls: 'status-danger', icon: '🔴', text: `Viento extremo (${Math.round(windKts)} kts). Navegación NO recomendada. Peligro.` };
    }
  }

  // Short status label for forecast cards
  function forecastStatus(windKts) {
    if (windKts < 8)  return { cls: 'f-bad',     label: 'Flojo' };
    if (windKts <= 12) return { cls: 'f-ok',      label: 'Iniciación' };
    if (windKts <= 25) return { cls: 'f-good',    label: '✔ Óptimo' };
    if (windKts <= 32) return { cls: 'f-strong',  label: 'Fuerte' };
    return               { cls: 'f-bad',           label: 'Extremo' };
  }

  // Formats date as short day name
  function formatDay(dateStr, index) {
    if (index === 0) return 'Hoy';
    if (index === 1) return 'Mañana';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  }

  async function fetchWeather() {
    const loadingEl  = document.getElementById('weather-loading');
    const dataEl     = document.getElementById('weather-data');
    const badgeEl    = document.getElementById('weather-live-badge');

    // Show loading skeleton
    if (loadingEl) loadingEl.style.display = 'block';
    if (dataEl)    dataEl.style.display    = 'none';

    // Spin the refresh button
    btnRefresh.classList.add('spinning');

    try {
      const res  = await fetch(API_URL);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const cur  = data.current;
      const day  = data.daily;

      // --- Current conditions ---
      const windKts = cur.wind_speed_10m;
      const gustKts = cur.wind_gusts_10m;
      const tempC   = cur.temperature_2m;
      const dirDeg  = cur.wind_direction_10m;

      document.getElementById('wind-value').textContent = `${Math.round(windKts)} kts`;
      document.getElementById('dir-value').textContent  = degreesToCompass(dirDeg);
      document.getElementById('temp-value').textContent = `${Math.round(tempC)}°C`;
      document.getElementById('gust-value').textContent = `${Math.round(gustKts)} kts`;

      const { cls, icon, text } = evaluateConditions(windKts, gustKts);
      const banner = document.getElementById('weather-status-banner');
      banner.textContent = `${icon} ${text}`;
      banner.className = `weather-status ${cls}`;

      // --- 5-day forecast strip ---
      const strip = document.getElementById('forecast-strip');
      if (strip && day) {
        strip.innerHTML = '';
        day.time.forEach((dateStr, i) => {
          const w   = day.wind_speed_10m_max[i];
          const g   = day.wind_gusts_10m_max[i];
          const d   = day.wind_direction_10m_dominant[i];
          const tH  = day.temperature_2m_max[i];
          const tL  = day.temperature_2m_min[i];
          const st  = forecastStatus(w);
          const card = document.createElement('div');
          card.className = `forecast-card ${st.cls}`;
          card.innerHTML = `
            <span class="fc-day">${formatDay(dateStr, i)}</span>
            <span class="fc-arrow" title="${degreesToCompass(d)}">${degreesToArrow(d)}</span>
            <span class="fc-wind">${Math.round(w)} kts</span>
            <span class="fc-gust">↑${Math.round(g)}</span>
            <span class="fc-temp">${Math.round(tH)}° / ${Math.round(tL)}°</span>
            <span class="fc-status">${st.label}</span>
          `;
          strip.appendChild(card);
        });
      }

      // --- Show data, update timestamp ---
      const now = new Date().toLocaleString('es-ES', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit' });
      document.getElementById('weather-updated').textContent = `🕐 Actualizado: ${now} · Fuente: Open-Meteo`;
      if (badgeEl) { badgeEl.textContent = '📡 EN VIVO'; badgeEl.style.opacity = '1'; }

      if (loadingEl) loadingEl.style.display = 'none';
      if (dataEl)    dataEl.style.display    = 'block';

    } catch (err) {
      console.error('Weather fetch error:', err);
      if (loadingEl) loadingEl.innerHTML = '<p style="color:#ef4444;font-size:0.85rem;">⚠️ No se pudo obtener el tiempo. Comprueba tu conexión.</p>';
      if (badgeEl)   { badgeEl.textContent = '⚠️ Sin datos'; badgeEl.style.opacity = '0.6'; }
    } finally {
      btnRefresh.classList.remove('spinning');
    }
  }

  // Fetch on load and on button click
  fetchWeather();
  btnRefresh.addEventListener('click', fetchWeather);
}

// ==========================================
// INTERACTIVE SPOTS MAP WITH TABS (index.html)
// ==========================================
function initSpotsMap() {
  const tabBtns = document.querySelectorAll('.spot-tab-btn');
  const details = document.querySelectorAll('.spot-detail');
  const mapFrames = document.querySelectorAll('.spot-map-frame');

  if (tabBtns.length === 0) return;

  function activateSpot(spotId) {
    // Tabs
    tabBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-spot') === spotId;
      btn.classList.toggle('active', isActive);
      btn.style.background    = isActive ? 'var(--accent-teal)' : 'var(--bg-card)';
      btn.style.color         = isActive ? '#fff' : 'var(--text-primary)';
      btn.style.borderColor   = isActive ? 'var(--accent-teal)' : 'var(--border-color)';
    });

    // Detail cards
    details.forEach(d => d.classList.remove('active'));
    const targetDetail = document.getElementById(`spot-${spotId}`);
    if (targetDetail) targetDetail.classList.add('active');

    // Map iframes
    mapFrames.forEach(f => {
      f.style.display = (f.id === `map-${spotId}`) ? 'block' : 'none';
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activateSpot(btn.getAttribute('data-spot'));
    });
  });
}


// ==========================================
// FAQ COLLAPSIBLE ACCORDION & LIVE SEARCH (FAQ.html)
// ==========================================
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.querySelector('.search-input');
  
  if (faqItems.length === 0) return;

  // Toggle accordion
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close other accordion items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-content').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-trigger').textContent.toLowerCase();
        const answer = item.querySelector('.faq-body').textContent.toLowerCase();
        
        if (question.includes(query) || answer.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}

// ==========================================
// INTERACTIVE COURSE MATCH WIZARD (escuela.html)
// ==========================================
function initWizard() {
  const wizard = document.getElementById('course-wizard');
  if (!wizard) return;

  const steps = wizard.querySelectorAll('.wizard-step');
  const nextBtns = wizard.querySelectorAll('.btn-next');
  const prevBtns = wizard.querySelectorAll('.btn-prev');
  const optionCards = wizard.querySelectorAll('.wizard-option-card');
  const resultBox = document.getElementById('wizard-result');
  const resultTitle = document.getElementById('result-course-title');
  const resultDesc = document.getElementById('result-course-desc');

  let selections = {
    sportExp: '', // 'yes', 'no'
    windExp: '',  // 'yes', 'no'
    objective: '' // 'learn', 'foil'
  };

  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      const stepEl = card.closest('.wizard-step');
      const question = stepEl.getAttribute('data-question');
      const value = card.getAttribute('data-value');

      // Select sibling cards in same step
      stepEl.querySelectorAll('.wizard-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      selections[question] = value;

      // Enable the next button for this step
      const nextBtn = stepEl.querySelector('.btn-next');
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentStep = btn.closest('.wizard-step');
      const currentStepIndex = parseInt(currentStep.getAttribute('data-step'));
      const nextStepIndex = currentStepIndex + 1;

      currentStep.classList.remove('active');

      if (nextStepIndex <= steps.length) {
        const nextStep = wizard.querySelector(`.wizard-step[data-step="${nextStepIndex}"]`);
        nextStep.classList.add('active');
      } else {
        // Calculate result
        showWizardResult();
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentStep = btn.closest('.wizard-step');
      const currentStepIndex = parseInt(currentStep.getAttribute('data-step'));
      const prevStepIndex = currentStepIndex - 1;

      currentStep.classList.remove('active');
      const prevStep = wizard.querySelector(`.wizard-step[data-step="${prevStepIndex}"]`);
      prevStep.classList.add('active');
      
      // Hide results if we go back
      resultBox.style.display = 'none';
    });
  });

  function showWizardResult() {
    resultBox.style.display = 'block';
    
    // Logic for course matches
    if (selections.sportExp === 'no' && selections.windExp === 'no') {
      resultTitle.innerHTML = '🟢 Curso Básico de Iniciación (Tablas SUP)';
      resultDesc.innerHTML = 'Tu mejor opción es empezar desde los cimientos. Te enseñaremos rumbos de viento y estabilidad en una tabla de Stand-Up Paddle antes de añadir el Foil. ¡Seguridad y diversión garantizadas!';
    } else if (selections.objective === 'foil' || (selections.sportExp === 'yes' && selections.windExp === 'yes')) {
      resultTitle.innerHTML = '⚡ Curso Foil Avanzado e Independiente';
      resultDesc.innerHTML = 'Ya posees experiencia en tablas y viento. Podemos saltar la iniciación básica e ir directos a manejar el ala Wing con el Foil, optimizando tu vuelo sobre el agua y trasluchadas (jibes) avanzadas.';
    } else {
      resultTitle.innerHTML = '🔵 Curso Wingfoil Intermedio';
      resultDesc.innerHTML = 'Recomendamos un curso mixto de 4 a 6 horas. Reforzaremos tus bases en el agua plana del embalse y te equiparemos rápidamente con material F-One específico para tu peso y habilidad para lograr tus primeros vuelos.';
    }

    resultBox.scrollIntoView({ behavior: 'smooth' });
  }

  // Reset button
  const btnReset = document.getElementById('btn-reset-wizard');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resultBox.style.display = 'none';
      steps.forEach(s => s.classList.remove('active'));
      optionCards.forEach(c => c.classList.remove('selected'));
      nextBtns.forEach(b => b.disabled = true);
      
      // Restart at step 1
      wizard.querySelector(`.wizard-step[data-step="1"]`).classList.add('active');
      selections = { sportExp: '', windExp: '', objective: '' };
    });
  }
}

// ==========================================
// CATALOG FILTERING & DETAIL MODAL (material.html)
// ==========================================
function initCatalog() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');
  const modalOverlay = document.getElementById('product-modal');
  
  if (products.length === 0) return;

  // Filter Catalog
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      products.forEach(product => {
        const category = product.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          product.style.display = 'flex';
        } else {
          product.style.display = 'none';
        }
      });
    });
  });

  // Modal Details
  const detailBtns = document.querySelectorAll('.btn-view-details');
  const modalClose = document.querySelector('.modal-close');

  const productsDb = {
    'fone-strike': {
      title: 'F-One Strike V4 Wing',
      subtitle: 'El ala definitiva de Wingfoil para velocidad y freeride',
      desc: 'El F-One Strike es el referente en rendimiento. Ofrece una tracción impresionante, estabilidad direccional impecable y una ligereza en los brazos que reduce el cansancio sustancialmente en tus sesiones del pantano.',
      specs: 'Material: Matrix-ST, Tallas: 2.5m a 5.5m, Enfoque: Velocidad y saltos.',
      brand: 'F-ONE',
      img: 'img/chico-ala.png'
    },
    'fone-rocket': {
      title: 'F-One Rocket Wing ASC',
      subtitle: 'Tabla de alta resistencia y vuelo rápido',
      desc: 'La tabla Rocket Wing ASC es la más recomendada para nuestra escuela. Es extremadamente estable en el agua estática del pantano de Ullibarri, ofreciendo un despegue fácil gracias a su línea de rocker optimizada.',
      specs: 'Volumen: 90L a 120L, Construcción: ASC ligera/rígida, Enfoque: Freeride/Iniciación.',
      brand: 'F-ONE',
      img: 'img/chica-rodillas.png'
    },
    'fone-phantom': {
      title: 'F-One Phantom Carbon Foil',
      subtitle: 'Hydrofoil de carbono para planeos infinitos',
      desc: 'El Phantom es un foil increíblemente ágil que te permite planear con brisas suaves. Proporciona una velocidad de despegue muy baja, permitiéndote levantar la tabla con vientos flojos de verano en Álava.',
      specs: 'Área: 1480cm², Mástil: Carbono 75cm, Conexión: Placa F-One.',
      brand: 'F-ONE',
      img: 'img/chica_304.png'
    },
    'manera-halo': {
      title: 'Manera Halo Harness',
      subtitle: 'Arnés ergonómico y ultra-ligero para largas sesiones',
      desc: 'El arnés Halo revoluciona la navegación de wingfoil reduciendo la carga de tracción del ala sobre tus brazos. Su estructura repartida evita puntos de presión incómodos, brindando libertad total en el torso.',
      specs: 'Tallas: S a XL, Material: Compuesto adaptativo, Enganche: Gancho deslizante.',
      brand: 'MANERA',
      img: 'img/chico15.png'
    },
    'manera-seafarer': {
      title: 'Manera Seafarer 4/3mm Wetsuit',
      subtitle: 'Neopreno flexible y de secado rápido',
      desc: 'Diseñado para soportar las aguas frescas del embalse en primavera y otoño. Ofrece un ajuste perfecto y costuras selladas térmicamente para garantizar que la temperatura de tu cuerpo se mantenga óptima.',
      specs: 'Espesor: 4/3 mm, Cremallera: Pecho (Chest zip), Tallas: S a XXL.',
      brand: 'MANERA',
      img: 'img/chica-tierra.png'
    },
    'manera-impact': {
      title: 'Manera Impact Vest',
      subtitle: 'Chaleco de impacto flotante con protección extra',
      desc: 'La seguridad es el pilar de nuestra escuela. Este chaleco proporciona la flotación exigida por ley y protege tu torso ante posibles caídas accidentales contra el foil o la tabla.',
      specs: 'Material: Espuma de célula cerrada NBR, Ajuste: Cremallera lateral.',
      brand: 'MANERA',
      img: 'img/chico_navegando.png'
    }
  };

  detailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemId = btn.getAttribute('data-item');
      const itemData = productsDb[itemId];

      if (itemData) {
        document.getElementById('modal-title').textContent = itemData.title;
        document.getElementById('modal-subtitle').textContent = itemData.subtitle;
        document.getElementById('modal-desc').textContent = itemData.desc;
        document.getElementById('modal-specs').textContent = itemData.specs;
        document.getElementById('modal-brand').textContent = itemData.brand;
        
        const modalImgWrapper = document.getElementById('modal-img-wrapper');
        const modalImg = document.getElementById('modal-img');
        if (modalImgWrapper && modalImg && itemData.img) {
          modalImg.src = itemData.img;
          modalImg.alt = itemData.title;
          modalImgWrapper.style.display = 'block';
        }

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==========================================
// CONTACT FORM VALIDATION & MOCK INBOX (contacto.html)
// ==========================================
function initContact() {
  const contactForm = document.getElementById('contact-form');
  const inboxList = document.getElementById('inbox-list');
  const inboxEmpty = document.getElementById('inbox-empty');
  const btnClearInbox = document.getElementById('btn-clear-inbox');

  if (!contactForm) return;

  // Load and render existing messages from localStorage
  let messages = JSON.parse(localStorage.getItem('wingfoil_messages')) || [];
  renderMessages();

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      showToast('⚠️ Por favor, rellena todos los campos obligatorios.', 'error');
      return;
    }

    // Add new message mock record
    const newMsg = {
      id: Date.now(),
      name,
      email,
      phone: phone || 'No indicado',
      message,
      date: new Date().toLocaleString('es-ES')
    };

    messages.unshift(newMsg);
    localStorage.setItem('wingfoil_messages', JSON.stringify(messages));
    
    // Reset Form
    contactForm.reset();
    
    // UI Feedback
    showToast('✉️ ¡Mensaje enviado con éxito! Guardado en el buzón local.', 'success');
    renderMessages();
  });

  if (btnClearInbox) {
    btnClearInbox.addEventListener('click', () => {
      messages = [];
      localStorage.removeItem('wingfoil_messages');
      renderMessages();
      showToast('🗑️ Buzón de entrada vaciado.', 'info');
    });
  }

  function renderMessages() {
    if (!inboxList) return;

    inboxList.innerHTML = '';
    
    if (messages.length === 0) {
      if (inboxEmpty) inboxEmpty.style.display = 'block';
      return;
    }

    if (inboxEmpty) inboxEmpty.style.display = 'none';

    messages.forEach(msg => {
      const card = document.createElement('div');
      card.className = 'inbox-card';
      card.innerHTML = `
        <div class="inbox-card-meta">
          <span class="inbox-card-sender">${escapeHtml(msg.name)} (${escapeHtml(msg.email)})</span>
          <span>${msg.date}</span>
        </div>
        <p style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Teléfono:</strong> ${escapeHtml(msg.phone)}</p>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0;">${escapeHtml(msg.message)}</p>
        <button class="btn-delete-msg" data-id="${msg.id}" title="Eliminar mensaje">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      inboxList.appendChild(card);
    });

    // Add event listeners to delete buttons
    inboxList.querySelectorAll('.btn-delete-msg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idToDelete = parseInt(btn.getAttribute('data-id'));
        messages = messages.filter(m => m.id !== idToDelete);
        localStorage.setItem('wingfoil_messages', JSON.stringify(messages));
        renderMessages();
        showToast('🗑️ Mensaje eliminado.', 'info');
      });
    });
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// ==========================================
// TOAST NOTIFICATIONS SYSTEM
// ==========================================
function showToast(message, type = 'success') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  if (type === 'error') {
    toast.style.borderLeft = '4px solid #ef4444';
  } else if (type === 'info') {
    toast.style.borderLeft = '4px solid #3b82f6';
  } else {
    toast.style.borderLeft = '4px solid #84cc16';
  }

  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
      if (toastContainer.childNodes.length === 0) {
        toastContainer.remove();
      }
    }, 300);
  }, 3500);
}
