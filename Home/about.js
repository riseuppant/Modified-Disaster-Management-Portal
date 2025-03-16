document.addEventListener("DOMContentLoaded", function() {
    document.body.style.opacity = "1";
    document.querySelector(".navbar").classList.add("show");
});

let tooltipPinned = false;
let infoBoxActive = false;
const infoBox = document.querySelector('.info-box');
const mapTooltip = document.querySelector('.map-tooltip');
const disasterCircles = document.querySelector('.disaster-circles');
const sideNav = document.querySelector('.side-nav');
const digitalVigilance = document.querySelector('.digital-vigilance');

const translations = {
    'en': {
        'navbar-brand': 'Indian Disaster Response Portal',
        'home': 'Home',
        'disaster-vigilance': 'Disaster Vigilance',
        'live-map': 'Live Disaster Map',
        'preparedness': 'Preparedness & Response',
        'about-us': 'About Us',
        'mission': 'Our Mission',
        'database': 'Our Database',
        'workflow': 'How It Works',
        'report-btn': 'Report Now',
        'interactive-maps': 'Interactive Maps',
        'earthquake': 'Earthquake',
        'flood': 'Floods',
        'tsunami': 'Tsunami',
        'cyclone': 'Cyclones',
        'landslide': 'Landslides',
        'map-title': 'Interactive Disaster Map',
        'map-description': 'Click on the Interactive Maps button to explore disaster-specific information.',
        'info-title': 'Information Center',
        'info-description': 'Access vital information about disaster preparedness, emergency contacts, and safety guidelines.',
        'vigilance-title': 'Digital Vigilance',
        'vigilance-description': 'Monitor and analyze disaster data through advanced digital surveillance.'
    },
    'hi': {
        'navbar-brand': 'Indian Disaster Response Portal',
        'home': 'होम',
        'disaster-vigilance': 'आपदा सतर्कता',
        'live-map': 'लाइव आपदा मानचित्र',
        'preparedness': 'तैयारी और प्रतिक्रिया',
        'about-us': 'हमारे बारे में',
        'mission': 'हमारा मिशन',
        'database': 'हमारा डेटाबेस',
        'workflow': 'यह कैसे कार्य करता है',
        'report-btn': 'अभी रिपोर्ट करें',
        'interactive-maps': 'इंटरएक्टिव मानचित्र',
        'earthquake': 'भूकंप',
        'flood': 'बाढ़',
        'tsunami': 'सुनामी',
        'cyclone': 'चक्रवात',
        'landslide': 'भूस्खलन',
        'map-title': 'इंटरएक्टिव आपदा मानचित्र',
        'map-description': 'आपदा-विशिष्ट जानकारी का पता लगाने के लिए इंटरएक्टिव मानचित्र बटन पर क्लिक करें।',
        'info-title': 'सूचना केंद्र',
        'info-description': 'आपदा तैयारी, आपातकालीन संपर्क और सुरक्षा दिशानिर्देशों से जुड़ी महत्वपूर्ण जानकारी प्राप्त करें।',
        'vigilance-title': 'डिजिटल सतर्कता',
        'vigilance-description': 'उन्नत डिजिटल निगरानी के माध्यम से आपदा डेटा की निगरानी और विश्लेषण करें।'
    },
    'ta': {
        'navbar-brand': 'Indian Disaster Response Portal',
        'home': 'முகப்பு',
        'disaster-vigilance': 'பேரிடர் விழிப்புணர்வு',
        'live-map': 'நிகழ் பேரிடர் வரைபடம்',
        'preparedness': 'தயார்ப்பு & பதிலளிப்பு',
        'about-us': 'எங்களை பற்றி',
        'mission': 'எங்கள் நோக்கம்',
        'database': 'எங்கள் தரவுத்தளம்',
        'workflow': 'இதன் செயல்பாடு',
        'report-btn': 'இப்போதே புகாரளிக்கவும்',
        'interactive-maps': 'உருவாக்கும் வரைபடங்கள்',
        'earthquake': 'நிலநடுக்கம்',
        'flood': 'வெள்ளம்',
        'tsunami': 'சுனாமி',
        'cyclone': 'சுழற்சி புயல்',
        'landslide': 'மண்ணிச்சரிவு',
        'map-title': 'உருவாக்கும் பேரிடர் வரைபடம்',
        'map-description': 'பேரிடர் தொடர்பான தகவலைக் காண உருவாக்கும் வரைபடம் பொத்தானை கிளிக் செய்யவும்.',
        'info-title': 'தகவல் மையம்',
        'info-description': 'பேரிடர் தயார்ப்பு, அவசர தொடர்புகள் மற்றும் பாதுகாப்பு வழிகாட்டுதல்கள் குறித்து முக்கியமான தகவல்களை அணுகவும்.',
        'vigilance-title': 'டிஜிட்டல் விழிப்புணர்வு',
        'vigilance-description': 'மேம்பட்ட டிஜிட்டல் கண்காணிப்பின் மூலம் பேரிடர் தரவைக் கண்காணிக்கவும் மற்றும் பகுப்பாய்வு செய்யவும்.'
        },
        
   
    'te': {
            'navbar-brand': 'Indian Disaster Response Portal',
            'home': 'హోం',
            'disaster-vigilance': 'విపత్తు అప్రమత్తత',
            'live-map': 'ప్రత్యక్ష విపత్తు మ్యాప్',
            'preparedness': 'సిద్ధత & స్పందన',
            'about-us': 'మా గురించి',
            'mission': 'మా లక్ష్యం',
            'database': 'మా డేటాబేస్',
            'workflow': 'ఇది ఎలా పనిచేస్తుంది',
            'report-btn': 'ఇప్పుడే నివేదించండి',
            'interactive-maps': 'ఇంటరాక్టివ్ మ్యాప్స్',
            'earthquake': 'భూకంపం',
            'flood': 'వరదలు',
            'tsunami': 'సునామీ',
            'cyclone': 'చక్రవాతం',
            'landslide': 'భూస్కలనం',
            'map-title': 'ఇంటరాక్టివ్ విపత్తు మ్యాప్',
            'map-description': 'విపత్తుకు సంబంధించిన సమాచారం తెలుసుకోవడానికి ఇంటరాక్టివ్ మ్యాప్ బటన్‌ను క్లిక్ చేయండి.',
            'info-title': 'సమాచార కేంద్రం',
            'info-description': 'విపత్తు సిద్ధత, అత్యవసర పరిచయాలు మరియు భద్రత మార్గదర్శకాలకు సంబంధించిన ముఖ్యమైన సమాచారం పొందండి.',
            'vigilance-title': 'డిజిటల్ అప్రమత్తత',
            'vigilance-description': 'ఆధునిక డిజిటల్ నిఘాతో విపత్తు డేటాను పర్యవేక్షించండి మరియు విశ్లేషించండి.'
        },
        
    'bn': {
        'navbar-brand': 'Indian Disaster Response Portal',
        'home': 'হোম',
        'disaster-vigilance': 'দুর্যোগ সতর্কতা',
        'live-map': 'লাইভ দুর্যোগ ম্যাপ',
        'preparedness': 'প্রস্তুতি এবং প্রতিক্রিয়া',
        'about-us': 'আমাদের সম্পর্কে',
        'mission': 'আমাদের লক্ষ্য',
        'database': 'আমাদের ডাটাবেস',
        'workflow': 'এটি কিভাবে কাজ করে',
        'report-btn': 'এখন রিপোর্ট করুন',
        'interactive-maps': 'ইন্টারেক্টিভ ম্যাপ',
        'earthquake': 'ভূমিকম্প',
        'flood': 'বন্যা',
        'tsunami': 'সুনামি',
        'cyclone': 'চক্রবাত',
        'landslide': 'ভূস্খলন',
        'map-title': 'ইন্টারেক্টিভ দুর্যোগ ম্যাপ',
        'map-description': 'দুর্যোগ',
        'info-title': 'তথ্য কেন্দ্র',
        'info-description': 'দুর্যোগ প্রস্তুতি, জরুরী যোগাযোগ এবং নিরাপত্তা নির্দেশিকা সম্পর্কে গুরুত্বপূর্ণ তথ্য অ্যাক্সেস করুন।',
        'vigilance-title': 'ডিজিটাল সতর্কতা',
        'vigilance-description': 'উন্নত ডিজিটাল পর্যবেক্ষণ দ্বারা দুর্যোগ ডেটা মনিটর এবং বিশ্লেষণ করুন।'
        
    }
};


function translatePage(lang) {
    const elements = {
        'a.nav-link[href="#"]': 'home',
        '#vigilanceDropdown': 'disaster-vigilance',
        '.dropdown-menu a[href="live-map.html"]': 'live-map',
        '.dropdown-menu a[href="preparedness.html"]': 'preparedness',
        '#aboutDropdown': 'about-us',
        '.dropdown-menu a[href="mission.html"]': 'mission',
        '.dropdown-menu a[href="database.html"]': 'database',
        '.dropdown-menu a[href="workflow.html"]': 'workflow',
        '#report-btn': 'report-btn',
        '.side-nav-links li a': 'interactive-maps',
        '.map-tooltip h3': 'map-title',
        '.map-tooltip p': 'map-description',
        '.info-box-content h3': 'info-title',
        '.info-box-content p': 'info-description',
        '.digital-vigilance-content h3': 'vigilance-title',
        '.digital-vigilance-content p': 'vigilance-description'
    };

    // Add disaster type translations
    const disasterTypes = ['earthquake', 'flood', 'tsunami', 'cyclone', 'landslide'];
    disasterTypes.forEach(type => {
        const selector = `.disaster-circle a[href*="${type}"] span`;
        elements[selector] = type;
    });

    // Apply translations while preserving icons
    for (const [selector, key] of Object.entries(elements)) {
        const element = document.querySelector(selector);
        if (element && translations[lang][key]) {
            if (element.querySelector('i')) {
                const icon = element.querySelector('i').outerHTML;
                element.innerHTML = icon + translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    }

    // Save language preference
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.setAttribute('lang', lang);
}

// Handle Interactive Maps click
function toggleMapsView(event) {
    event.stopPropagation();
    tooltipPinned = !tooltipPinned;
    infoBoxActive = false; // Reset info box state

    if (tooltipPinned) {
        mapTooltip.classList.add('show', 'pinned');
        disasterCircles.classList.add('show');
        infoBox.style.display = 'none'; // Hide info box
        // Add animation to hide digital vigilance
        digitalVigilance.classList.add('hide');
    } else {
        mapTooltip.classList.remove('show', 'pinned');
        disasterCircles.classList.remove('show');
        infoBox.style.display = 'flex'; // Show info box
        // Show digital vigilance again
        digitalVigilance.classList.remove('hide');
    }
}

// Handle Information Center click
infoBox.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    document.documentElement.style.background = '#0f172a';
    document.body.style.transition = 'opacity 0.08s linear';
    document.body.style.opacity = '0';

    requestAnimationFrame(() => {
        window.location.href = 'preparedness.html';
    });
});

// Handle Digital Vigilance click
digitalVigilance.addEventListener('click', (event) => {
    event.stopPropagation();
    // Fade out animation
    document.body.style.opacity = '0';

    // Redirect to digital vigilance page after fade
    setTimeout(() => {
        window.location.href = 'live-map.html?type=all';
    }, 300);
});

// Update document click handler to include digital vigilance reset
document.addEventListener('click', (event) => {
    if (!event.target.closest('.digital-vigilance') &&
        !event.target.closest('.side-nav') &&
        !event.target.closest('.disaster-circles') &&
        !event.target.closest('.map-tooltip') &&
        !event.target.closest('.info-box')) {

        // Reset all states
        tooltipPinned = false;
        infoBoxActive = false;
        mapTooltip.classList.remove('show', 'pinned');
        disasterCircles.classList.remove('show');
        infoBox.classList.remove('active');
        digitalVigilance.classList.remove('active');

        // Show all boxes
        infoBox.classList.remove('box-hidden');
        sideNav.classList.remove('box-hidden');
        digitalVigilance.classList.remove('box-hidden');
    }
});

// Update document click handler
document.addEventListener('click', (event) => {
    if (!event.target.closest('.side-nav') &&
        !event.target.closest('.disaster-circles') &&
        !event.target.closest('.map-tooltip')) {

        tooltipPinned = false;
        infoBoxActive = false;
        mapTooltip.classList.remove('show', 'pinned');
        disasterCircles.classList.remove('show');
        infoBox.classList.remove('active');
        infoBox.style.display = 'flex'; // Show info box when clicking elsewhere
        sideNav.style.transform = '';
        sideNav.style.opacity = '';
        // Show digital vigilance again
        digitalVigilance.classList.remove('hide');
        sideNav.classList.remove('box-hidden');
        digitalVigilance.classList.remove('box-hidden');
    }
});
document.querySelectorAll('.disaster-circle').forEach(circle => {
    circle.addEventListener('click', function() {
        // Get the disaster type from the circle's data attribute
        const disasterType = this.getAttribute('data-disaster-type');
        const location = this.getAttribute('data-location');
        
        // Redirect to livemap.html with query parameters
        window.location.href = `livemap.html?disaster=${disasterType}&location=${location}`;
    });
});
// Update the click handlers
mapTooltip.addEventListener('click', toggleMapsView);
sideNav.addEventListener('click', toggleMapsView);

// Handle live map link click
document.getElementById('Live-Disaster-Map').addEventListener('click', () => {
    infoBox.style.display = 'none';
});

// Add click handler to document to close tooltip
document.addEventListener('click', () => {
    tooltipPinned = false;
    document.querySelector('.map-tooltip').classList.remove('pinned');
    document.querySelector('.map-tooltip').classList.remove('show');
    document.querySelector('.disaster-circles').classList.remove('show');
});

// Click handlers with stopPropagation
document.querySelector('.map-tooltip').addEventListener('click', toggleTooltip);
document.querySelector('.side-nav').addEventListener('click', toggleTooltip);

// Hover handlers (only work when not pinned)
document.querySelector('.side-nav').addEventListener('mouseenter', () => {
    if (!tooltipPinned) {
        document.querySelector('.map-tooltip').classList.add('show');
    }
});

document.querySelector('.side-nav').addEventListener('mouseleave', () => {
    if (!tooltipPinned) {
        document.querySelector('.map-tooltip').classList.remove('show');
    }
});

// Add click handler for disaster circles
document.querySelectorAll('.disaster-circle').forEach(circle => {
    const link = circle.querySelector('a');

    // Handle both circle and link clicks
    [circle, link].forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const disasterType = link.getAttribute('data-disaster');
            window.location.href = `live-map.html?type=${disasterType}`;
        });
    });
});

// Update the circle styles to show it's clickable
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .disaster-circle {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .disaster-circle:hover {
            background-color: rgba(255, 255, 255, 0.25);
            transform: scale(1.1);
        }

        .disaster-circle a {
            pointer-events: none;
        }
    </style>
`);

const allBoxes = [
    document.querySelector('.digital-vigilance'),
    document.querySelector('.side-nav'),
    document.querySelector('.info-box'),
    document.querySelector('.map-tooltip')
];

function activateBox(activeBox) {
    document.body.classList.add('box-active');
    allBoxes.forEach(box => {
        if (box === activeBox) {
            box.classList.add('active');
            // Hide disaster circles when any box is activated
            disasterCircles.classList.remove('show');
        } else {
            box.classList.remove('active');
        }
    });
}

function deactivateAllBoxes() {
    document.body.classList.remove('box-active');
    allBoxes.forEach(box => box.classList.remove('active'));
}

// Add click handlers for all boxes
allBoxes.forEach(box => {
    box.addEventListener('click', (e) => {
        e.stopPropagation();
        activateBox(box);
    });
});

// Update document click handler
document.addEventListener('click', () => {
    deactivateAllBoxes();
});

// Add to existing script section
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler for preparedness link
    const prepLink = document.querySelector('a[href="preparedness.html"]');
    if (prepLink) {
        prepLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Add smooth transition before redirect
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.href = 'preparedness.html';
            }, 300);
        });
    }
});

// Add smooth transition for mission link
document.querySelector('a[href="mission.html"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = this.href;
    }, 300);
});

// Add smooth transition for report button
document.getElementById('report-btn').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = this.href;
    }, 300);
});

// Update the report button click handler
document.getElementById('report-btn').addEventListener('click', function(e) {
    e.preventDefault();

    // Add clicked class for scale animation
    this.classList.add('clicked');

    // Fade out body
    document.body.style.opacity = '0';

    // Navigate after animations complete
    setTimeout(() => {
        window.location.href = this.href;
    }, 300);
});

// Rest of existing script code...
// Add smooth transition for database link
document.getElementById('databaseLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = 'database.html';
    }, 300);
});

// Apply saved language preference on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    document.querySelector('.lang-select').value = savedLang;
    translatePage(savedLang);
});

// Add Theme Toggle Function
function toggleTheme() {
    const body = document.body;
    const isGoingDark = !body.classList.contains('dark-theme');

    // Toggle dark theme class
    body.classList.toggle('dark-theme');

    // Store theme preference
    localStorage.setItem('darkTheme', isGoingDark ? 'true' : 'false');
}

document.addEventListener('DOMContentLoaded', function() {
    /* ...existing DOMContentLoaded code... */
    
    // Check and apply saved theme preference
    const darkTheme = localStorage.getItem('darkTheme') === 'true';
    if (darkTheme) {
        document.body.classList.add('dark-theme');
    }
});
// Function to handle earthquake disaster circle clicks
function setupEarthquakeRedirect() {
    // Select all elements with the earthquake-disaster class
    // (Update this selector to match your actual HTML structure)
    const earthquakeElements = document.querySelectorAll('.earthquake-disaster, .disaster-circle[data-type="earthquake"]');
    
    earthquakeElements.forEach(element => {
        element.addEventListener('click', function() {
            // Redirect to livemap.html with a query parameter to indicate earthquake selection
            window.location.href = 'live_map.html?disaster=earthquake';
        });
        
        // Add cursor pointer to indicate clickable
        element.style.cursor = 'pointer';
        
        // Optional: Add a tooltip to indicate the action
        element.setAttribute('title', 'Click to view live earthquake map');
    });
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setupEarthquakeRedirect();
    
    // Your existing about.js code can continue here...
});
// Function to handle flood disaster circle clicks