import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "characters.json");

const app = express();
const PORT = 5000;

// Autoriser le front Vite (port 5173 par défaut)
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Helpers lecture/écriture
async function readData() {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    if (e.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      return [];
    }
    throw e;
  }
}
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// GET all
app.get("/characters", async (_req, res) => {
  const data = await readData();
  res.json(data);
});

// POST create
app.post("/characters", async (req, res) => {
  const { name, realname, universe } = req.body;
  if (!name || !realname || !universe) {
    return res.status(400).json({ error: "name, realname, universe requis" });
  }
  const data = await readData();
  const nextId = (data.length ? Math.max(...data.map(c => c.id)) : 0) + 1;
  const created = { id: nextId, name, realname, universe };
  data.push(created);
  await writeData(data);
  res.status(201).json(created);
});

// PUT update
app.put("/characters/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, realname, universe } = req.body;
  const data = await readData();
  const idx = data.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  data[idx] = {
    ...data[idx],
    name: name ?? data[idx].name,
    realname: realname ?? data[idx].realname,
    universe: universe ?? data[idx].universe
  };
  await writeData(data);
  res.json(data[idx]);
});

// DELETE
app.delete("/characters/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = await readData();
  const idx = data.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const removed = data.splice(idx, 1)[0];
  await writeData(data);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Backend OK → http://localhost:${PORT}`);
});
