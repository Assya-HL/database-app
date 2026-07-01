const API_BASE = "http://127.0.0.1:8001"; // Port dyalk exact f terminal

let currentDB = "";
let currentTable = "";
let currentHeaders = [];

// App d-marrage
document.addEventListener("DOMContentLoaded", () => {
    fetchDatabases();
});

// 1. List Databases
async function fetchDatabases() {
    try {
        const res = await fetch(`${API_BASE}/databases/`);
        const dbs = await res.json();
        const container = document.getElementById("db-list");
        container.innerHTML = "";

        if (!Array.isArray(dbs) || dbs.length === 0) {
            container.innerHTML = "Aucune base de données trouvée.";
            return;
        }

        dbs.forEach(dbName => {
            const isActive = dbName === currentDB;
            const div = document.createElement("div");
            div.className = `db-item ${isActive ? 'active' : ''}`;
            div.innerHTML = `
                <span style="cursor:pointer;" onclick="selectDatabase('${dbName}')">📁 <b>${dbName}</b></span>
                <button onclick="deleteDatabase('${dbName}')" style="color:red;">Supprimer</button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        document.getElementById("db-list").innerHTML = "<b style='color:red;'>Erreur de connexion avec FastAPI (Vérifie le port 8001)</b>";
    }
}

// 2. Create Database
async function createDatabase() {
    const name = document.getElementById("new-db-name").value.trim();
    if (!name) return alert("Entrez un nom !");
    try {
        await fetch(`${API_BASE}/databases/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        document.getElementById("new-db-name").value = "";
        fetchDatabases();
    } catch (err) { alert("Erreur."); }
}

// 3. Delete DB
async function deleteDatabase(dbName) {
    if (!confirm(`Supprimer DB ${dbName}?`)) return;
    try {
        await fetch(`${API_BASE}/databases/${dbName}`, { method: 'DELETE' });
        if (currentDB === dbName) {
            currentDB = "";
            currentTable = "";
            document.getElementById("current-db-name").innerText = "Aucune";
        }
        fetchDatabases();
    } catch (err) { alert("Erreur."); }
}

// 4. Select DB
function selectDatabase(dbName) {
    currentDB = dbName;
    document.getElementById("current-db-name").innerText = dbName;
    fetchDatabases();
    fetchTables();
}

// 5. List Tables
async function fetchTables() {
    try {
        const res = await fetch(`${API_BASE}/databases/${currentDB}/tables`);
        const tables = await res.json();
        const container = document.getElementById("table-list");
        container.innerHTML = "";

        if (!Array.isArray(tables) || tables.length === 0) {
            container.innerHTML = "Aucune table CSV disponible.";
            return;
        }

        tables.forEach(tableName => {
            const isActive = tableName === currentTable;
            const div = document.createElement("div");
            div.className = `table-item ${isActive ? 'active' : ''}`;
            div.innerHTML = `
                <span style="cursor:pointer;" onclick="selectTable('${tableName}')">📄 ${tableName}.csv</span>
                <button onclick="deleteTable('${tableName}')" style="color:red;">Supprimer</button>
            `;
            container.appendChild(div);
        });
    } catch (err) { console.error(err); }
}

// 6. Create Table
async function createTable() {
    const name = document.getElementById("new-table-name").value.trim();
    const columnsStr = document.getElementById("new-table-columns").value.trim();
    if (!currentDB) return alert("Sélectionnez d'abord une DB !");
    if (!name || !columnsStr) return alert("Remplissez les champs !");
    
    const columns = columnsStr.split(",").map(c => c.trim());
    try {
        await fetch(`${API_BASE}/databases/${currentDB}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: name, columns: columns })
        });
        document.getElementById("new-table-name").value = "";
        document.getElementById("new-table-columns").value = "";
        fetchTables();
    } catch (err) { alert("Erreur."); }
}

// 7. Delete Table
async function deleteTable(tableName) {
    if(!confirm(`Supprimer la table ${tableName}?`)) return;
    try {
        await fetch(`${API_BASE}/databases/${currentDB}/tables/${tableName}`, { method: 'DELETE' });
        if (currentTable === tableName) {
            currentTable = "";
            document.getElementById("data-table").style.display = "none";
        }
        fetchTables();
    } catch (err) { alert("Erreur."); }
}

// 8. Select Table
function selectTable(tableName) {
    currentTable = tableName;
    document.getElementById("active-table-title").innerText = `${tableName}.csv`;
    document.getElementById("data-table").style.display = "table";
    fetchTables();
    fetchRows();
}

// 9. Fetch Rows
async function fetchRows() {
    try {
        const res = await fetch(`${API_BASE}/databases/${currentDB}/${currentTable}/rows`);
        const data = await res.json();
        
        const thead = document.getElementById("table-headers");
        const tbody = document.getElementById("table-body");
        thead.innerHTML = "";
        tbody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            thead.innerHTML = "<th>Table vide ou pas de colonne id</th>";
            return;
        }

        currentHeaders = Object.keys(data[0]);

        currentHeaders.forEach(h => {
            const th = document.createElement("th");
            th.innerText = h;
            thead.appendChild(th);
        });

        data.forEach(row => {
            const tr = document.createElement("tr");
            currentHeaders.forEach(h => {
                const td = document.createElement("td");
                td.innerText = row[h] !== undefined ? row[h] : "";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    } catch (err) { console.error(err); }
}

// 10. Add Row Prompt simple
async function openAddRowModal() {
    if (!currentTable || currentHeaders.length === 0) return alert("Sélectionnez une table valide.");
    const payload = {};
    
    for (let h of currentHeaders) {
        const val = prompt(`Entrez la valeur pour la colonne [ ${h} ] :`);
        if (val === null) return; // annuler
        payload[h] = val;
    }

    try {
        await fetch(`${API_BASE}/databases/${currentDB}/${currentTable}/rows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        fetchRows();
    } catch (err) { alert("Erreur."); }
}