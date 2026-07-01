const API = "http://127.0.0.1:8001";

let currentDB = "";
let currentTable = "";
let modalMode = "";

let modalData = {};

function toast(msg){
const t=document.getElementById("toast");
t.innerText=msg;
t.style.display="block";
setTimeout(()=>t.style.display="none",2000);
}

/* ================= MODAL ================= */

function openModal(title, bodyHTML, mode){
document.getElementById("modalTitle").innerText=title;
document.getElementById("modalBody").innerHTML=bodyHTML;
document.getElementById("modal").classList.remove("hidden");
modalMode=mode;
}

function closeModal(){
document.getElementById("modal").classList.add("hidden");
modalData={};
}

function confirmModal(){
if(modalMode==="db") createDB();
if(modalMode==="table") createTable();
if(modalMode==="row") createRow();
closeModal();
}

/* ================= DB ================= */

async function loadDatabases(){
const res=await fetch(`${API}/databases/`);
const data=await res.json();

document.getElementById("dbList").innerHTML="";

data.forEach(db=>{
document.getElementById("dbList").innerHTML+=`
<li onclick="selectDB('${db}')">${db}</li>
`;
});

document.getElementById("dbCount").innerText=data.length;
}

function openDbModal(){
openModal("Create Database",`
<input id="dbName" placeholder="Database name">
`,"db");
}

async function createDB(){
const name=document.getElementById("dbName").value;

await fetch(`${API}/databases/`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name})
});

toast("Database created");
loadDatabases();
}

/* ================= TABLE ================= */

function selectDB(db){
currentDB=db;
document.getElementById("currentDB").innerText=db;
loadTables();
}

async function loadTables(){
const res=await fetch(`${API}/databases/${currentDB}/tables`);
const data=await res.json();

document.getElementById("tables").innerHTML="";

data.forEach(t=>{
document.getElementById("tables").innerHTML+=`
<div class="card">
<h3>${t}</h3>
<button class="btn primary" onclick="loadRows('${t}')">Open</button>
</div>
`;
});

document.getElementById("tableCount").innerText=data.length;
}

function openTableModal(){
openModal("Create Table",`
<input id="tableName" placeholder="Table name">
<input id="columns" placeholder="id,name,email">
`,"table");
}

async function createTable(){
const table=document.getElementById("tableName").value;
const columns=document.getElementById("columns").value.split(",");

await fetch(`${API}/databases/${currentDB}/tables`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({table,columns})
});

toast("Table created");
loadTables();
}

/* ================= ROWS ================= */

function openRowModal(){
openModal("Add Row",`
<textarea id="rowData" placeholder='{"id":1,"name":"Ali"}'></textarea>
`,"row");
}

async function createRow(){
const row=JSON.parse(document.getElementById("rowData").value);

await fetch(`${API}/databases/${currentDB}/${currentTable}/rows`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(row)
});

toast("Row added");
loadRows(currentTable);
}

async function loadRows(table){
currentTable=table;

const res=await fetch(`${API}/databases/${currentDB}/${table}/rows`);
const data=await res.json();

if(!data.length) return;

const cols=Object.keys(data[0]);

document.getElementById("thead").innerHTML=`
<tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr>
`;

document.getElementById("tbody").innerHTML=data.map(r=>
`<tr>${cols.map(c=>`<td>${r[c]}</td>`).join("")}</tr>`
).join("");

document.getElementById("rowCount").innerText=data.length;
}

/* INIT */
loadDatabases();