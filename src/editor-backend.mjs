import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.join(__dirname, 'assets')

const app = express()
app.use(cors())
app.use(express.json())

// Helper to read JSON file
async function readJsonFile(filename) {
	const filePath = path.join(ASSETS_DIR, filename)
	try {
		const data = await fs.readFile(filePath, 'utf-8')
		return JSON.parse(data)
	} catch (err) {
		if (err.code === 'ENOENT') {
			return []
		}
		throw err
	}
}

// Helper to write JSON file
async function writeJsonFile(filename, data) {
	const filePath = path.join(ASSETS_DIR, filename)
	await fs.writeFile(filePath, JSON.stringify(data, null, '\t'), 'utf-8')
}

// ============ ARTIFACTS ============

// Get all artifacts
app.get('/api/artifacts', async (req, res) => {
	try {
		const artifacts = await readJsonFile('artifacts.json')
		res.json(artifacts)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Save all artifacts
app.put('/api/artifacts', async (req, res) => {
	try {
		await writeJsonFile('artifacts.json', req.body)
		res.json({ success: true })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// ============ POSSIBILITIES ============

// Get all possibilities
app.get('/api/possibilities', async (req, res) => {
	try {
		const possibilities = await readJsonFile('possibilities.json')
		res.json(possibilities)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Save all possibilities
app.put('/api/possibilities', async (req, res) => {
	try {
		await writeJsonFile('possibilities.json', req.body)
		res.json({ success: true })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

const PORT = 3001
app.listen(PORT, () => {
	console.log(`Editor backend running at http://localhost:${PORT}`)
})
