// Server-side code for handling disaster data API requests
// This would typically be in a separate file like server.js or api.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg'); // Assuming PostgreSQL database
const ExcelJS = require('exceljs'); // For Excel file generation

// Database connection
const pool = new Pool({
  user: 'disaster_db_user',
  host: 'localhost',
  database: 'disaster_database',
  password: 'your_password',
  port: 5432,
});

// API routes
// Get data for a specific disaster type
router.get('/disasters/:disasterType', async (req, res) => {
  try {
    const { disasterType } = req.params;
    
    // Validate disaster type to prevent SQL injection
    const validDisasterTypes = ['earthquake', 'flood', 'cyclone', 'tsunami', 'landslide'];
    if (!validDisasterTypes.includes(disasterType)) {
      return res.status(400).json({ error: 'Invalid disaster type' });
    }
    
    // Query database
    const query = `
      SELECT * FROM disaster_events 
      WHERE type = $1 
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query, [disasterType]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching disaster data:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// Get complete dataset with format option
router.get('/disasters/complete', async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    
    // Query for all data
    const query = `
      SELECT * FROM disaster_events 
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query);
    const data = result.rows;
    
    // Handle different format responses
    switch (format) {
      case 'json':
        return res.json(data);
        
      case 'csv':
        const csvData = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=complete_disaster_data.csv');
        return res.send(csvData);
        
      case 'xlsx':
        const workbook = createExcelWorkbook(data);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=complete_disaster_data.xlsx');
        return workbook.xlsx.write(res)
          .then(() => {
            res.end();
          });
          
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    console.error('Error fetching complete dataset:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// Get disaster statistics
router.get('/disasters/statistics', async (req, res) => {
  try {
    // Get count by disaster type
    const typeQuery = `
      SELECT type, COUNT(*) as count 
      FROM disaster_events 
      GROUP BY type 
      ORDER BY count DESC
    `;
    
    // Get count by year
    const yearQuery = `
      SELECT EXTRACT(YEAR FROM date) as year, COUNT(*) as count 
      FROM disaster_events 
      GROUP BY year 
      ORDER BY year DESC
    `;
    
    // Get most recent disasters
    const recentQuery = `
      SELECT * FROM disaster_events 
      ORDER BY date DESC 
      LIMIT 5
    `;
    
    const typeResult = await pool.query(typeQuery);
    const yearResult = await pool.query(yearQuery);
    const recentResult = await pool.query(recentQuery);
    
    res.json({
      byType: typeResult.rows,
      byYear: yearResult.rows,
      recent: recentResult.rows
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  let csvContent = headers.join(',') + '\n';
  
  // Add each row of data
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else {
        return value;
      }
    }).join(',');
    
    csvContent += row + '\n';
  });
  
  return csvContent;
}

// Helper function to create Excel workbook
function createExcelWorkbook(data) {
  if (!data || data.length === 0) {
    return null;
  }
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Disaster Data');
  
  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.columns = headers.map(header => ({
    header: header,
    key: header,
    width: 15
  }));
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563eb' } // Primary color from CSS
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFF' } };
  
  // Add rows
  data.forEach(item => {
    const row = {};
    headers.forEach(header => {
      row[header] = item[header];
    });
    worksheet.addRow(row);
  });
  
  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length }
  };
  
  return workbook;
}

module.exports = router;

// In your main server file (e.g., server.js):
// const express = require('express');
// const app = express();
// const disasterRoutes = require('./routes/disasterRoutes');
// app.use('/api', disasterRoutes);
// app.listen(3000, () => console.log('Server running on port 3000'));