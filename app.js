/* ==========================================================================
   VEXNAIRE Visual Studio — Client-Side Gallery, Filter & Lightbox Engine
   ========================================================================== */

let currentActiveStyle = '';
let currentVisibleCards = [];
let currentLightboxIndex = -1;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateVisibleCards();

  // Read URL query parameter for category filtering if on /work
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    const targetPill = document.querySelector(`.filter-pill[data-filter="${catParam}"]`);
    if (targetPill) filterGallery(catParam, targetPill);
  }

  // Read URL query parameter for prefilled style on /contact
  const styleParam = urlParams.get('style');
  if (styleParam) {
    const styleEl = document.getElementById('referenceStyle');
    if (styleEl) styleEl.value = styleParam;
  }

  // Read URL query parameter for prefilled discipline on /contact
  const disciplineParam = urlParams.get('discipline');
  if (disciplineParam) {
    const projectTypeEl = document.getElementById('projectType');
    if (projectTypeEl) {
      for (let option of projectTypeEl.options) {
        if (option.value.toLowerCase().includes(disciplineParam.toLowerCase()) || disciplineParam.toLowerCase().includes(option.value.toLowerCase())) {
          projectTypeEl.value = option.value;
          break;
        }
      }
    }
  }

  // Read URL query parameter for prefilled tier
  const tierParam = urlParams.get('tier');
  if (tierParam) {
    const briefEl = document.getElementById('projectBrief');
    if (briefEl && !briefEl.value.includes(`[Selected Package: ${tierParam}]`)) {
      briefEl.value = `[Selected Package: ${tierParam}]\n\n` + briefEl.value;
    }
  }
});

// Category Filtering Function
function filterGallery(category, buttonEl) {
  const cards = document.querySelectorAll('.showcase-card');
  const pills = document.querySelectorAll('.filter-pill');

  // Update active pill button
  pills.forEach(pill => {
    pill.classList.remove('active');
    pill.setAttribute('aria-selected', 'false');
  });

  if (buttonEl) {
    buttonEl.classList.add('active');
    buttonEl.setAttribute('aria-selected', 'true');
  } else {
    const targetPill = document.querySelector(`.filter-pill[data-filter="${category}"]`);
    if (targetPill) {
      targetPill.classList.add('active');
      targetPill.setAttribute('aria-selected', 'true');
    }
  }

  // Filter cards with subtle staggered reveal animation
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      setTimeout(() => {
        card.style.display = 'none';
      }, 250);
    }
  });

  updateVisibleCards();
}

// Update the list of currently visible cards for lightbox carousel navigation
function updateVisibleCards() {
  const allCards = document.querySelectorAll('.showcase-card');
  currentVisibleCards = Array.from(allCards).filter(c => c.style.display !== 'none');
}

// Lightbox Open/Close/Navigate Controls
function openLightbox(imgSrc, title, subtitle, styleIdentifier) {
  const modal = document.getElementById('lightbox');
  const modalImg = document.getElementById('lightboxImg');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalSub = document.getElementById('lightboxSubtitle');

  if (!modal || !modalImg) return;

  currentActiveStyle = styleIdentifier || title;
  modalImg.src = imgSrc;
  modalImg.alt = title;
  if (modalTitle) modalTitle.textContent = title;
  if (modalSub) modalSub.textContent = subtitle;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Find index in currentVisibleCards for arrow navigation
  currentLightboxIndex = currentVisibleCards.findIndex(card => {
    const img = card.querySelector('img');
    return img && img.getAttribute('src') === imgSrc;
  });
}

function closeLightbox() {
  const modal = document.getElementById('lightbox');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  if (!currentVisibleCards || currentVisibleCards.length === 0) return;

  currentLightboxIndex += direction;
  if (currentLightboxIndex < 0) currentLightboxIndex = currentVisibleCards.length - 1;
  if (currentLightboxIndex >= currentVisibleCards.length) currentLightboxIndex = 0;

  const targetCard = currentVisibleCards[currentLightboxIndex];
  if (!targetCard) return;

  const mediaEl = targetCard.querySelector('.card-media');
  if (mediaEl) {
    mediaEl.click();
  }
}

// Form Pre-fill & Direct Submission
function prefillBrief(styleName) {
  const briefEl = document.getElementById('projectBrief');
  const styleEl = document.getElementById('referenceStyle');
  const requestSection = document.getElementById('request');

  if (briefEl && requestSection) {
    if (styleEl) styleEl.value = styleName;
    requestSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => briefEl.focus(), 350);
  } else {
    window.location.href = `/contact?style=${encodeURIComponent(styleName || '')}`;
  }
}

function selectTier(tierName) {
  const briefEl = document.getElementById('projectBrief');
  const requestSection = document.getElementById('request');

  if (briefEl && requestSection) {
    requestSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const marker = `Selected package: ${tierName}`;
      if (!briefEl.value.includes(marker)) briefEl.value = `${marker}\n\n${briefEl.value}`;
      briefEl.focus();
    }, 350);
  } else {
    window.location.href = `/contact?tier=${encodeURIComponent(tierName || '')}`;
  }
}

async function handleBriefSubmit(event) {
  event.preventDefault();

  const nameEl = document.getElementById('clientName');
  const emailEl = document.getElementById('clientEmail');
  const projectTypeEl = document.getElementById('projectType');
  const resolutionEl = document.getElementById('targetResolution');
  const referenceEl = document.getElementById('referenceStyle');
  const briefEl = document.getElementById('projectBrief');
  const consentEl = document.getElementById('privacyConsent');
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');

  if (!nameEl || !emailEl || !projectTypeEl || !resolutionEl || !briefEl || !consentEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const projectType = projectTypeEl.value;
  const resolution = resolutionEl.value;
  const reference = referenceEl ? referenceEl.value.trim() : '';
  const brief = briefEl.value.trim();

  const showError = (message) => {
    if (!statusEl) return;
    statusEl.className = 'form-status error';
    statusEl.style.display = 'block';
    statusEl.textContent = message;
  };

  if (!name || !email || !emailEl.checkValidity() || !brief) {
    showError('Please fill in a valid name, work email, and project brief.');
    return;
  }
  if (!consentEl.checked) {
    showError('Please confirm that you agree to FormSubmit processing this inquiry before submitting.');
    consentEl.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Brief…';
  }
  if (statusEl) {
    statusEl.className = 'form-status loading';
    statusEl.style.display = 'block';
    statusEl.textContent = 'Sending your brief through FormSubmit to Vexnaire…';
  }

  const payload = {
    name,
    email,
    discipline: projectType,
    resolution,
    reference: reference || 'Open to recommendation',
    brief,
    privacy_consent: 'Confirmed via project brief form',
    _subject: 'Vexnaire Project Brief: ' + projectType + ' — ' + name
  };

  try {
    const response = await fetch('https://formsubmit.co/ajax/vivekvala562@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await response.json(); } catch (_) {}
    if (!response.ok || (result.success !== 'true' && result.success !== true)) {
      throw new Error(result.message || 'Submission failed');
    }

    if (statusEl) {
      statusEl.className = 'form-status success';
      statusEl.style.display = 'block';
      statusEl.textContent = 'Thanks, ' + name + '. FormSubmit accepted your project brief and forwarded it to Vexnaire. The studio will review it and respond if it can take the project on.';
    }
    document.getElementById('briefForm').reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Brief Sent ✓';
    }
  } catch (err) {
    console.warn('FormSubmit request failed; offering mailto fallback:', err);
    if (statusEl) {
      statusEl.className = 'form-status error';
      statusEl.style.display = 'block';
      const mailtoUrl = 'mailto:hello@vexnaire.studio?subject=' + encodeURIComponent('Vexnaire Project Inquiry | ' + projectType + ' | ' + name) + '&body=' + encodeURIComponent('Hello Vexnaire Studio,\n\nName: ' + name + '\nEmail: ' + email + '\nDiscipline: ' + projectType + '\nResolution: ' + resolution + '\nReference: ' + reference + '\n\nBrief:\n' + brief);
      statusEl.innerHTML = 'We could not send the form through FormSubmit. <a href="' + mailtoUrl + '" style="color:var(--gold-2);text-decoration:underline;font-weight:600;">Open your email client to send this brief instead →</a>';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Project Brief →';
    }
  }
}

// Keyboard controls for lightbox navigation & escape
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('lightbox');
  if (!modal || !modal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1);
  } else if (e.key === 'ArrowRight') {
    navigateLightbox(1);
  }
});
