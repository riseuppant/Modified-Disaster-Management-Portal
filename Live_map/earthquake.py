import pandas as pd
import folium
from folium.plugins import HeatMap
import datetime
import os
import json

# -----------------------
# Data Preprocessing
# -----------------------
# Load the earthquake dataset
data_path = 'E:/Design/Hackathon/Ui/data/updated_merged_data.csv'
df = pd.read_csv(data_path)

# Standardize column names
df.columns = df.columns.str.strip()

# Ensure required columns are present
required_columns = {'Latitude', 'Longitude', 'Magnitude'}
if not required_columns.issubset(df.columns):
    raise ValueError(f"CSV file must contain {required_columns} columns. Found: {df.columns.tolist()}")

# Convert data types
df['Latitude'] = pd.to_numeric(df['Latitude'], errors='coerce')
df['Longitude'] = pd.to_numeric(df['Longitude'], errors='coerce')
df['Magnitude'] = pd.to_numeric(df['Magnitude'], errors='coerce')

# Drop rows with missing or invalid Latitude, Longitude, or Magnitude
df = df.dropna(subset=['Latitude', 'Longitude', 'Magnitude'])
df = df[(df['Latitude'].between(-90, 90)) & (df['Longitude'].between(-180, 180))]

# -----------------------
# Generate Heatmap Settings
# -----------------------
# Compute the center of earthquakes for better visualization (for folium map, if needed)
map_center = [df['Latitude'].mean(), df['Longitude'].mean()]

# For our custom HTML template we'll be using JavaScript/Leaflet directly.
# We'll extract the heat data (as a list) and the radius value.
radius = 15 if len(df) > 1000 else 25
heat_data = list(zip(df['Latitude'], df['Longitude'], df['Magnitude']))

# Convert heat_data and radius into JSON strings for injection into our template.
heat_data_js = json.dumps(heat_data)
radius_js = str(radius)

# -----------------------
# Custom HTML Template
# -----------------------
html_template = f"""<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <script>
        L_NO_TOUCH = false;
        L_DISABLE_3D = false;
    </script>
    <title>Earthquake Visualization</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
    <!-- CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-glyphicons.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.0/css/all.min.css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/python-visualization/folium/folium/templates/leaflet.awesome.rotate.min.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
    
    <style>
        html, body {{
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }}
        
        #map {{
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            z-index: 1;
        }}
        
        .leaflet-container {{
            font-size: 1rem;
        }}
        
        .header {{
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 90%;
        }}
        
        .header h1 {{
            margin: 0;
            font-size: 24px;
            color: #333;
        }}
        
        .search-container {{
            position: absolute;
            top: 70px;
            left: 10px;
            z-index: 1000;
            width: 300px;
            max-width: 90%;
        }}
        
        .search-box {{
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        
        .info-panel {{
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            max-width: 300px;
        }}
        
        .info-panel h3 {{
            margin-top: 0;
            font-size: 18px;
            color: #333;
        }}
        
        .magnitude-legend {{
            margin-top: 10px;
        }}
        
        .magnitude-item {{
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }}
        
        .magnitude-color {{
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border-radius: 50%;
        }}
        
        .controls {{
            position: absolute;
            top: 120px;
            left: 10px;
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 300px;
            max-width: 90%;
        }}
        
        .filter-control {{
            margin-bottom: 10px;
        }}
        
        .filter-control label {{
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }}
        
        .filter-control input {{
            width: 100%;
        }}
        
        .filter-value {{
            display: inline-block;
            width: 40px;
            text-align: right;
        }}
        
        .custom-popup .leaflet-popup-content-wrapper {{
            background: rgba(255, 255, 255, 0.9);
            border-radius: 5px;
        }}
        
        .custom-popup .leaflet-popup-content {{
            margin: 12px;
            font-size: 14px;
        }}
        
        .earthquake-info {{
            padding: 5px;
        }}
        
        .earthquake-info h4 {{
            margin: 0 0 5px 0;
            color: #d32f2f;
        }}
        
        .earthquake-info p {{
            margin: 3px 0;
        }}
    </style>
    
    <!-- JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/python-visualization/folium@main/folium/templates/leaflet_heat.min.js"></script>
    <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
</head>
<body>
    <div class="header">
        <h1>Earthquake Visualization Map</h1>
    </div>
    
    <div class="search-container">
        <input type="text" id="search-box" class="search-box" placeholder="Search for a location...">
    </div>
    
    <div class="controls">
        <div class="filter-control">
            <label for="magnitude-filter">Filter by Magnitude: <span id="magnitude-value" class="filter-value">3.0</span>+</label>
            <input type="range" id="magnitude-filter" min="2.0" max="8.0" step="0.1" value="3.0">
        </div>
        <div class="filter-control">
            <label for="year-filter">Filter by Year: <span id="year-value" class="filter-value">All</span></label>
            <input type="range" id="year-filter" min="2000" max="2023" step="1" value="2000">
        </div>
        <button id="reset-filters" class="btn btn-sm btn-primary mt-2">Reset Filters</button>
    </div>
    
    <div class="info-panel">
        <h3>Earthquake Information</h3>
        <p>This map shows earthquake data across the Indian subcontinent and surrounding regions.</p>
        <div class="magnitude-legend">
            <h4>Magnitude Scale:</h4>
            <div class="magnitude-item">
                <div class="magnitude-color" style="background-color: #0000ff;"></div>
                <span>2.0 - 3.0: Minor</span>
            </div>
            <div class="magnitude-item">
                <div class="magnitude-color" style="background-color: #00ff00;"></div>
                <span>3.1 - 4.0: Light</span>
            </div>
            <div class="magnitude-item">
                <div class="magnitude-color" style="background-color: #ffff00;"></div>
                <span>4.1 - 5.0: Moderate</span>
            </div>
            <div class="magnitude-item">
                <div class="magnitude-color" style="background-color: #ff7f00;"></div>
                <span>5.1 - 6.0: Strong</span>
            </div>
            <div class="magnitude-item">
                <div class="magnitude-color" style="background-color: #ff0000;"></div>
                <span>6.1+: Major/Great</span>
            </div>
        </div>
        <p class="mt-3"><small>Data source: USGS Earthquake Database</small></p>
    </div>
    
    <div id="map" class="folium-map"></div>
    
    <script>
        // Initialize Leaflet map
        var map = L.map("map", {{
            center: [22.55343658001879, 88.92104854368934],
            crs: L.CRS.EPSG3857,
            zoom: 5,
            zoomControl: true,
            preferCanvas: false,
        }});
    
        L.tileLayer("https://{{s}}.basemaps.cartocdn.com/light_all/{{z}}/{{x}}/{{y}}{{r}}.png", {{
            minZoom: 0,
            maxZoom: 20,
            maxNativeZoom: 20,
            noWrap: false,
            attribution: "&copy; <a href=\\"https://www.openstreetmap.org/copyright\\">OpenStreetMap</a> contributors &copy; <a href=\\"https://carto.com/attributions\\">CARTO</a>",
            subdomains: "abcd",
            detectRetina: false,
            tms: false,
            opacity: 1,
        }}).addTo(map);
    
        // Add geocoder search control
        var geocoder = L.Control.geocoder({{
            defaultMarkGeocode: false,
            position: 'topleft',
            placeholder: 'Search for a location...',
            errorMessage: 'Nothing found.',
            showResultIcons: true
        }}).on('markgeocode', function(e) {{
            var bbox = e.geocode.bbox;
            var poly = L.polygon([
                bbox.getSouthEast(),
                bbox.getNorthEast(),
                bbox.getNorthWest(),
                bbox.getSouthWest()
            ]);
            map.fitBounds(poly.getBounds());
        }}).addTo(map);
        
        // Hide the geocoder control since we have our custom search box
        document.querySelector('.leaflet-control-geocoder').style.display = 'none';
        
        // Connect our custom search box to the geocoder
        document.getElementById('search-box').addEventListener('keypress', function(e) {{
            if (e.key === 'Enter') {{
                geocoder.geocode(this.value);
            }}
        }});
    
        // Use earthquake heat data generated from Python
        var earthquakeData = {heat_data_js};
    
        // Add heat layer to the map using the earthquake data from Python
        L.heatLayer(earthquakeData, {{
            minOpacity: 0.3,
            maxZoom: 8,
            radius: {radius_js},
            blur: 15,
            gradient: {{
                0.1: '#0000ff',
                0.3: '#00ff00',
                0.5: '#ffff00',
                0.7: '#ff7f00',
                1.0: '#ff0000'
            }}
        }}).addTo(map);
    </script>
</body>
</html>
"""

# -----------------------
# Save the final HTML file and open in browser
# -----------------------
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"earthquake_heatmap_{timestamp}.html"

with open(filename, "w", encoding="utf-8") as f:
    f.write(html_template)

import webbrowser
webbrowser.open('file://' + os.path.abspath(filename))

print(f"Heatmap has been saved as '{filename}' and opened in the browser.")
