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
// WEATHER / WIND SIMULATOR WIDGET (index.html)
// ==========================================
function initWeather() {
  const btnRefresh = document.querySelector('.btn-refresh');
  if (!btnRefresh) return;

  const windVal = document.getElementById('wind-value');
  const dirVal = document.getElementById('dir-value');
  const tempVal = document.getElementById('temp-value');
  const gustVal = document.getElementById('gust-value');
  const statusBanner = document.getElementById('weather-status-banner');

  const weatherStates = [
    { wind: '18 kts', dir: 'Norte (N)', temp: '19°C', gusts: '22 kts', status: 'optimal', text: 'Condiciones excelentes. Norte activo en Club Náutico Vitoria y Ullibarri.' },
    { wind: '15 kts', dir: 'Sur (S)', temp: '21°C', gusts: '19 kts', status: 'optimal', text: 'Viento Sur ideal para Ullibarri-Gamboa o Club Náutico.' },
    { wind: '22 kts', dir: 'Suroeste (SO)', temp: '17°C', gusts: '27 kts', status: 'optimal', text: 'Suroeste fuerte. Spot ideal: Garaio (Side-shore).' },
    { wind: '6 kts', dir: 'Variable', temp: '23°C', gusts: '8 kts', status: 'caution', text: 'Viento flojo. No apto para planear, pero perfecto para SUP y remo.' },
    { wind: '14 kts', dir: 'Sureste (SE)', temp: '20°C', gusts: '16 kts', status: 'optimal', text: 'Buen viento térmico para Ullibarri-Gamboa.' },
    { wind: '35 kts', dir: 'Sur (S)', temp: '15°C', gusts: '42 kts', status: 'caution', text: 'Viento de tempestad extremo. Consultar con instructores.' }
  ];

  function updateWeather() {
    // Add rotation animation to refresh button
    btnRefresh.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      btnRefresh.style.transform = 'none';
    }, 500);

    const randomIndex = Math.floor(Math.random() * weatherStates.length);
    const state = weatherStates[randomIndex];

    windVal.textContent = state.wind;
    dirVal.textContent = state.dir;
    tempVal.textContent = state.temp;
    gustVal.textContent = state.gusts;

    statusBanner.textContent = state.text;
    statusBanner.className = 'weather-status'; // Reset class
    if (state.status === 'optimal') {
      statusBanner.classList.add('status-optimal');
    } else {
      statusBanner.classList.add('status-caution');
    }
  }

  btnRefresh.addEventListener('click', updateWeather);
}

// ==========================================
// INTERACTIVE SPOTS VECTOR MAP (index.html)
// ==========================================
function initSpotsMap() {
  const mapMarkers = document.querySelectorAll('.map-spot-marker');
  const details = document.querySelectorAll('.spot-detail');
  
  if (mapMarkers.length === 0) return;

  mapMarkers.forEach(marker => {
    marker.addEventListener('click', () => {
      const spotId = marker.getAttribute('data-spot');
      
      // Deactivate all markers and details
      mapMarkers.forEach(m => m.classList.remove('active'));
      details.forEach(d => d.classList.remove('active'));
      
      // Activate target
      marker.classList.add('active');
      const targetDetail = document.getElementById(`spot-${spotId}`);
      if (targetDetail) {
        targetDetail.classList.add('active');
      }
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
      brand: 'F-ONE'
    },
    'fone-rocket': {
      title: 'F-One Rocket Wing ASC',
      subtitle: 'Tabla de alta resistencia y vuelo rápido',
      desc: 'La tabla Rocket Wing ASC es la más recomendada para nuestra escuela. Es extremadamente estable en el agua estática del pantano de Ullibarri, ofreciendo un despegue fácil gracias a su línea de rocker optimizada.',
      specs: 'Volumen: 90L a 120L, Construcción: ASC ligera/rígida, Enfoque: Freeride/Iniciación.',
      brand: 'F-ONE'
    },
    'fone-phantom': {
      title: 'F-One Phantom Carbon Foil',
      subtitle: 'Hydrofoil de carbono para planeos infinitos',
      desc: 'El Phantom es un foil increíblemente ágil que te permite planear con brisas suaves. Proporciona una velocidad de despegue muy baja, permitiéndote levantar la tabla con vientos flojos de verano en Álava.',
      specs: 'Área: 1480cm², Mástil: Carbono 75cm, Conexión: Placa F-One.',
      brand: 'F-ONE'
    },
    'manera-halo': {
      title: 'Manera Halo Harness',
      subtitle: 'Arnés ergonómico y ultra-ligero para largas sesiones',
      desc: 'El arnés Halo revoluciona la navegación de wingfoil reduciendo la carga de tracción del ala sobre tus brazos. Su estructura repartida evita puntos de presión incómodos, brindando libertad total en el torso.',
      specs: 'Tallas: S a XL, Material: Compuesto adaptativo, Enganche: Gancho deslizante.',
      brand: 'MANERA'
    },
    'manera-seafarer': {
      title: 'Manera Seafarer 4/3mm Wetsuit',
      subtitle: 'Neopreno flexible y de secado rápido',
      desc: 'Diseñado para soportar las aguas frescas del embalse en primavera y otoño. Ofrece un ajuste perfecto y costuras selladas térmicamente para garantizar que la temperatura de tu cuerpo se mantenga óptima.',
      specs: 'Espesor: 4/3 mm, Cremallera: Pecho (Chest zip), Tallas: S a XXL.',
      brand: 'MANERA'
    },
    'manera-impact': {
      title: 'Manera Impact Vest',
      subtitle: 'Chaleco de impacto flotante con protección extra',
      desc: 'La seguridad es el pilar de nuestra escuela. Este chaleco proporciona la flotación exigida por ley y protege tu torso ante posibles caídas accidentales contra el foil o la tabla.',
      specs: 'Material: Espuma de célula cerrada NBR, Ajuste: Cremallera lateral.',
      brand: 'MANERA'
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
