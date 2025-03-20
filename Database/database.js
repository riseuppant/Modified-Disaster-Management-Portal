// Main JavaScript file for disaster database app

// DOM elements
let disasterCards;
let downloadButtons;
let formatOptions;
let modalOverlay;
let modalCloseBtn;
let modalCancelBtn;
let modalDownloadBtn;
let completeDownloadBtn;
let loadingIndicator;

// Database connection parameters
const API_BASE_URL = '/api/disasters';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  disasterCards = document.querySelectorAll('.disaster-card');
  downloadButtons = document.querySelectorAll('.download-btn');
  formatOptions = document.querySelectorAll('.format-option input');
  modalOverlay = document.querySelector('.modal-overlay');
  modalCloseBtn = document.querySelector('.close-modal');
  modalCancelBtn = document.querySelector('.btn-cancel');
  modalDownloadBtn = document.querySelector('.btn-download');
  completeDownloadBtn = document.querySelector('.download-btn.primary');
  loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading';
  loadingIndicator.innerHTML = '<div></div><div></div><div></div><div></div>';
  
  // Setup event listeners
  initializeEventListeners();
  
  // Setup canvas background
  initializeCanvasBackground();
  
  // Initialize scroll animations
  initializeScrollAnimations();
});

// Set up all event listeners
function initializeEventListeners() {
  // Individual disaster download buttons
  downloadButtons.forEach(button => {
    if (!button.classList.contains('primary')) {
      button.addEventListener('click', handleDisasterTypeDownload);
    }
  });
  
  // Complete dataset download button
  if (completeDownloadBtn) {
    completeDownloadBtn.addEventListener('click', handleCompleteDownloadClick);
  }
  
  // Modal close and cancel buttons
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', closeModal);
  }
  
  // Modal download button
  if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener('click', handleModalDownload);
  }
  
  // Close modal when clicking outside
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }
  
  // Keyboard events for modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

// Handle individual disaster type download
function handleDisasterTypeDownload(e) {
  e.preventDefault();
  
  const card = this.closest('.disaster-card');
  if (!card) return;
  
  const disasterType = card.getAttribute('data-type');
  if (!disasterType) return;
  
  // Show loading in this card
  showCardLoading(card, true);
  
  // Download the specific disaster data
  fetchDisasterData(disasterType)
    .then(data => {
      if (data) {
        downloadAsCSV(data, `${disasterType}_disaster_data.csv`);
        showDownloadSuccess(card);
      }
    })
    .catch(error => {
      console.error('Download failed:', error);
      showDownloadError(card, 'Failed to download. Try again.');
    })
    .finally(() => {
      showCardLoading(card, false);
    });
}

// Handle complete dataset download button click
function handleCompleteDownloadClick(e) {
  e.preventDefault();
  openModal();
}

// Handle modal download button click
function handleModalDownload() {
  // Get selected format
  let selectedFormat = 'csv'; // Default format
  
  formatOptions.forEach(option => {
    if (option.checked) {
      selectedFormat = option.value;
    }
  });
  
  // Show loading
  showModalLoading(true);
  
  // Download complete dataset in selected format
  fetchCompleteDataset(selectedFormat)
    .then(data => {
      if (data) {
        downloadData(data, `complete_disaster_dataset.${selectedFormat}`, selectedFormat);
        showNotification('Download successful!', 'success');
      }
    })
    .catch(error => {
      console.error('Complete download failed:', error);
      showNotification('Download failed. Please try again.', 'error');
    })
    .finally(() => {
      showModalLoading(false);
      closeModal();
    });
}

// Fetch data for a specific disaster type
async function fetchDisasterData(disasterType) {
  try {
    const response = await fetch(`${API_BASE_URL}/${disasterType}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${disasterType} data:`, error);
    throw error;
  }
}

// Fetch complete dataset in specified format
async function fetchCompleteDataset(format) {
  try {
    const response = await fetch(`${API_BASE_URL}/complete?format=${format}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    // Handle different response types based on format
    if (format === 'json') {
      return await response.json();
    } else {
      return await response.blob();
    }
  } catch (error) {
    console.error('Error fetching complete dataset:', error);
    throw error;
  }
}

// Download data as CSV
function downloadAsCSV(data, filename) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Add headers
  if (data.length > 0) {
    csvContent += Object.keys(data[0]).join(',') + '\r\n';
  }
  
  // Add rows
  data.forEach(item => {
    const row = Object.values(item).map(value => {
      // Handle commas in values with quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',');
    csvContent += row + '\r\n';
  });
  
  // Create download link and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download data in different formats
function downloadData(data, filename, format) {
  if (format === 'json' && typeof data !== 'blob') {
    // Convert JSON to string if it's not already a blob
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, filename);
  } else if (data instanceof Blob) {
    // If data is already a blob (for binary formats like xlsx)
    downloadBlob(data, filename);
  } else {
    // Convert to CSV if format is csv
    downloadAsCSV(data, filename);
  }
}

// Download blob data
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

// Show loading indicator in a specific card
function showCardLoading(card, isLoading) {
  if (isLoading) {
    // Create and append loading indicator
    const loadingClone = loadingIndicator.cloneNode(true);
    card.appendChild(loadingClone);
    card.classList.add('loading-active');
  } else {
    // Remove loading indicator
    const cardLoader = card.querySelector('.loading');
    if (cardLoader) {
      card.removeChild(cardLoader);
    }
    card.classList.remove('loading-active');
  }
}

// Show loading indicator in modal
function showModalLoading(isLoading) {
  const modalContent = modalOverlay.querySelector('.modal-content');
  
  if (isLoading) {
    modalContent.style.opacity = '0.5';
    const loadingClone = loadingIndicator.cloneNode(true);
    modalOverlay.appendChild(loadingClone);
  } else {
    modalContent.style.opacity = '1';
    const modalLoader = modalOverlay.querySelector('.loading');
    if (modalLoader) {
      modalOverlay.removeChild(modalLoader);
    }
  }
}

// Show success message in card
function showDownloadSuccess(card) {
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.textContent = 'Download successful!';
  card.appendChild(successElement);
  
  setTimeout(() => {
    card.removeChild(successElement);
  }, 3000);
}

// Show error message in card
function showDownloadError(card, message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  card.appendChild(errorElement);
  
  setTimeout(() => {
    card.removeChild(errorElement);
  }, 3000);
}

// Show notification toast
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Open modal
function openModal() {
  if (modalOverlay) {
    modalOverlay.classList.add('active');
  }
}

// Close modal
function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    
    // Reset any loading state
    const modalLoader = modalOverlay.querySelector('.loading');
    if (modalLoader) {
      modalOverlay.removeChild(modalLoader);
    }
    
    const modalContent = modalOverlay.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.opacity = '1';
    }
  }
}

// Initialize canvas background
function initializeCanvasBackground() {
  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Particle system for background
  const particles = [];
  const particleCount = 50;
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      color: 'rgba(255, 255, 255, 0.3)',
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25
    });
  }
  
  // Animation function
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Boundary check
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX = -particle.speedX;
      }
      
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY = -particle.speedY;
      }
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
    
    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Start animation
  animate();
}

// Initialize scroll animations
function initializeScrollAnimations() {
  const sections = document.querySelectorAll('section');
  
  // Animate sections when they come into view
  function checkScroll() {
    sections.forEach((section, index) => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      // If section is in viewport
      if (sectionTop < windowHeight * 0.75) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        // Add delay for staggered effect
        section.style.transitionDelay = `${index * 0.1}s`;
      }
    });
  }
  
  // Check positions on scroll
  window.addEventListener('scroll', checkScroll);
  
  // Initial check
  checkScroll();
}