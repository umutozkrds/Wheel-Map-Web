const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'denemee',
    password: '1234',
    port: 5432,
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/places', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const { rows } = await pool.query(`
            SELECT 
                id,
                ad,
                aciklama,
                wheelchair,
                category,
                ST_Y(geometry) as lat,
                ST_X(geometry) as lon,
                ST_AsText(geometry) as geometry_text
            FROM mekanlar
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/api/places/:category", async (req, res) => {
    const { category } = req.params;
    const { rows } = await pool.query(`
        SELECT 
                id,
                ad,
                aciklama,
                wheelchair,
                category,
                ST_Y(geometry) as lat,
                ST_X(geometry) as lon,
                ST_AsText(geometry) as geometry_text
            FROM mekanlar WHERE category = $1
    `, [category]);
    res.json(rows);
});

app.get("/api/categories", async (req, res) => {
    const { rows } = await pool.query(`
        SELECT DISTINCT category FROM mekanlar
    `);
    res.json(rows);
});

app.post('/api/places', async (req, res) => {
    try {
        const { ad, aciklama, wheelchair, lat, lon, category } = req.body;

        if (!ad || !lat || !lon) {
            return res.status(400).json({ error: 'Missing required fields: ad, lat, lon' });
        }

        const { rows } = await pool.query(
            'INSERT INTO mekanlar (ad, aciklama, wheelchair, geometry, category) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6) RETURNING *',
            [ad, aciklama, wheelchair, lon, lat, category]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Error adding place:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = app;