import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000";

export default function App() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", realname: "", universe: "" });

  // Charger la liste
  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/characters`);
    const data = await res.json();
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Ajouter
  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.realname || !form.universe) return;
    const res = await fetch(`${API_URL}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const created = await res.json();
    setRows((r) => [...r, created]);
    setForm({ name: "", realname: "", universe: "" });
  };

  // Supprimer
  const remove = async (id) => {
    await fetch(`${API_URL}/characters/${id}`, { method: "DELETE" });
    setRows((r) => r.filter((x) => x.id !== id));
  };

  // Sauver édition
  const save = async (row) => {
    const res = await fetch(`${API_URL}/characters/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row)
    });
    const updated = await res.json();
    setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
    setEditingId(null);
  };

  const startEdit = (id) => setEditingId(id);
  const cancelEdit = () => setEditingId(null);

  const table = useMemo(
    () => (
      <table className="min-w-full border border-gray-300 bg-white rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-gray-100">
          <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left">
            <th className="w-16">ID</th>
            <th>Name</th>
            <th>Real name</th>
            <th>Universe</th>
            <th className="w-48 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              <EditRow
                key={r.id}
                value={r}
                onCancel={cancelEdit}
                onSave={save}
              />
            ) : (
              <ReadRow
                key={r.id}
                value={r}
                onEdit={() => startEdit(r.id)}
                onDelete={() => remove(r.id)}
              />
            )
          )}
          {!rows.length && !loading && (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                Aucun personnage
              </td>
            </tr>
          )}
        </tbody>
      </table>
    ),
    [rows, editingId, loading]
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Characters</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-8 text-center">Chargement…</div>
        ) : (
          table
        )}
      </div>

      <form
        onSubmit={add}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm grid md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Spider-Man"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Real name</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.realname}
            onChange={(e) => setForm({ ...form, realname: e.target.value })}
            placeholder="Peter Parker"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Universe</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.universe}
            onChange={(e) => setForm({ ...form, universe: e.target.value })}
            placeholder="Marvel"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg px-4 py-2 bg-black text-white hover:opacity-90"
        >
          Add new character
        </button>
      </form>
    </div>
  );
}

function ReadRow({ value, onEdit, onDelete }) {
  return (
    <tr className="border-t [&>td]:px-4 [&>td]:py-3 hover:bg-gray-50">
      <td>{value.id}</td>
      <td>{value.name}</td>
      <td>{value.realname}</td>
      <td>{value.universe}</td>
      <td className="text-center space-x-2">
        <button
          onClick={onEdit}
          className="rounded-lg px-3 py-1 border hover:bg-gray-100"
        >
          Upgrade
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg px-3 py-1 border text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function EditRow({ value, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...value });
  return (
    <tr className="border-t [&>td]:px-4 [&>td]:py-3 bg-yellow-50">
      <td>{value.id}</td>
      <td>
        <input
          className="w-full rounded border px-2 py-1"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </td>
      <td>
        <input
          className="w-full rounded border px-2 py-1"
          value={draft.realname}
          onChange={(e) => setDraft({ ...draft, realname: e.target.value })}
        />
      </td>
      <td>
        <input
          className="w-full rounded border px-2 py-1"
          value={draft.universe}
          onChange={(e) => setDraft({ ...draft, universe: e.target.value })}
        />
      </td>
      <td className="text-center space-x-2">
        <button
          onClick={() => onSave(draft)}
          className="rounded-lg px-3 py-1 border bg-black text-white"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1 border hover:bg-gray-100"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}
