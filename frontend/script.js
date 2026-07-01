const API="http://127.0.0.1:8001";

let currentDB="";
let currentTable="";
let modalType="";

/* TOAST */
function toast(msg){
const t=document.getElementById("toast");
t.innerText=msg;
t.style.display="block";
setTimeout(()=>t.style.display="none",2000);
}

/* MODAL */
function openModal(type){
modalType=type;
document.getElementById("modal").classList.remove("hidden");

let html="";

if(type==="db"){
document.getElementById("modalTitle").innerText="Create Database";
html=`<input id="input" placeholder="Database name">`;
}

if(type==="table"){
document.getElementById("modalTitle").innerText="Create Table";
html=`
<input id="input1" placeholder="Table name">
<input id="input2" placeholder="id,name,email">
`;
}

if(type==="row"){
document.getElementById("modalTitle").innerText="Add Row";
html=`<textarea id="input" placeholder='{"id":1,"name":"Ali"}'></textarea>`;
}

document.getElementById("modalBody").innerHTML=html;
}

function closeModal(){
document.getElementById("modal").classList.add("hidden");
}

function confirmModal(){

if(modalType==="db") createDB();
if(modalType==="table") createTable();
if(modalType==="row") createRow();

closeModal();
}

/* DB */
async function loadDB(){
const res=await fetch(`${API}/databases/`);
const data=await res.json();

document.getElementById("dbList").innerHTML="";

data.forEach(db=>{
document.getElementById("dbList").innerHTML+=
`<div onclick="selectDB('${db}')">${db}</div>`;
});

document.getElementById("dbCount").innerText=data.length;
}

async function createDB(){
let name=document.getElementById("input").value;

await fetch(`${API}/databases/`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name})
});

toast("Database created");
loadDB();
}

function selectDB(db){
currentDB=db;
document.getElementById("title").innerText=db;
loadTables();
}

/* TABLES */
async function loadTables(){
const res=await fetch(`${API}/databases/${currentDB}/tables`);
const data=await res.json();

document.getElementById("tables").innerHTML="";

data.forEach(t=>{
document.getElementById("tables").innerHTML+=
`<div onclick="loadRows('${t}')">${t}</div>`;
});

document.getElementById("tableCount").innerText=data.length;
}

async function createTable(){
let name=document.getElementById("input1").value;
let cols=document.getElementById("input2").value.split(",");

await fetch(`${API}/databases/${currentDB}/tables`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({table:name,columns:cols})
});

toast("Table created");
loadTables();
}

/* ROWS */
async function loadRows(table){
currentTable=table;

const res=await fetch(`${API}/databases/${currentDB}/${table}/rows`);
const data=await res.json();

if(!data.length) return;

const cols=Object.keys(data[0]);

document.getElementById("thead").innerHTML=
"<tr>"+cols.map(c=>`<th>${c}</th>`).join("")+"</tr>";

document.getElementById("tbody").innerHTML=
data.map(r=>
"<tr>"+cols.map(c=>`<td>${r[c]}</td>`).join("")+"</tr>"
).join("");

document.getElementById("rowCount").innerText=data.length;
}

async function createRow(){
let row=JSON.parse(document.getElementById("input").value);

await fetch(`${API}/databases/${currentDB}/${currentTable}/rows`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(row)
});

toast("Row added");
loadRows(currentTable);
}

/* INIT */
loadDB();