const API="http://127.0.0.1:8001";

let currentDB="";
let currentTable="";
let mode="";

function toast(msg){
const t=document.getElementById("toast");
t.innerText=msg;
t.style.display="block";
setTimeout(()=>t.style.display="none",2000);
}

/* LOAD DB */
async function loadDB(){
const res=await fetch(`${API}/databases/`);
const data=await res.json();

document.getElementById("dbList").innerHTML="";

data.forEach(db=>{
document.getElementById("dbList").innerHTML+=
`<div onclick="selectDB('${db}')">${db}</div>`;
});
}

function selectDB(db){
currentDB=db;
document.getElementById("currentDB").innerText=db;
loadTables();
}

/* TABLES */
async function loadTables(){
const res=await fetch(`${API}/databases/${currentDB}/tables`);
const data=await res.json();

document.getElementById("tableList").innerHTML="";

data.forEach(t=>{
document.getElementById("tableList").innerHTML+=
`<div onclick="loadRows('${t}')">${t}</div>`;
});
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
}

/* MODAL */
function openModal(type){
mode=type;
document.getElementById("modal").classList.remove("hidden");

let html="";

if(type==="db"){
document.getElementById("modalTitle").innerText="Create Database";
html=`<input id="input">`;
}

if(type==="table"){
document.getElementById("modalTitle").innerText="Create Table";
html=`
<input id="input1" placeholder="table">
<input id="input2" placeholder="id,name,email">
`;
}

if(type==="row"){
document.getElementById("modalTitle").innerText="Add Row";
html=`<textarea id="input"></textarea>`;
}

document.getElementById("modalBody").innerHTML=html;
}

function closeModal(){
document.getElementById("modal").classList.add("hidden");
}

async function save(){

if(mode==="db"){
let name=document.getElementById("input").value;

await fetch(`${API}/databases/`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name})
});

toast("DB created");
loadDB();
closeModal();
}

if(mode==="table"){
let table=document.getElementById("input1").value;
let cols=document.getElementById("input2").value.split(",");

await fetch(`${API}/databases/${currentDB}/tables`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({table,columns:cols})
});

toast("Table created");
loadTables();
closeModal();
}

if(mode==="row"){
let row=JSON.parse(document.getElementById("input").value);

await fetch(`${API}/databases/${currentDB}/${currentTable}/rows`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(row)
});

toast("Row added");
loadRows(currentTable);
closeModal();
}
}

loadDB();