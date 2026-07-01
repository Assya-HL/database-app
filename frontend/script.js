const API = "http://127.0.0.1:8001";

let currentDB = null;
let currentTable = null;
let currentRows = [];

const databaseList = document.getElementById("databaseList");
const tableList = document.getElementById("tableList");

const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");

const dbCount = document.getElementById("dbCount");
const tableCount = document.getElementById("tableCount");
const rowCount = document.getElementById("rowCount");

const loader = document.getElementById("loader");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const saveBtn = document.getElementById("saveBtn");
const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

let modalAction = null;


/***************************
LOADER
****************************/

function showLoader(){

loader.style.display = "flex";

}

function hideLoader(){

loader.style.display = "none";

}


/***************************
TOAST
****************************/

function toast(msg){

const container = document.getElementById("toastContainer");

const div = document.createElement("div");

div.className = "toast";

div.innerText = msg;

container.appendChild(div);

setTimeout(()=>{

div.remove()

},3000);

}


/***************************
MODAL
****************************/

function openModal(title, html, callback){

modal.classList.remove("hidden");

modalTitle.innerText = title;

modalBody.innerHTML = html;

modalAction = callback;

}

function closeModal(){

modal.classList.add("hidden");

}

closeModalBtn.onclick = closeModal;

cancelBtn.onclick = closeModal;

saveBtn.onclick = ()=>{

if(modalAction){

modalAction();

}

};



/***************************
DATABASES
****************************/

async function loadDatabases(){

showLoader();

const res = await fetch(

`${API}/databases/`

);

const data = await res.json();

databaseList.innerHTML = "";

dbCount.innerText = data.length;

data.forEach(db=>{

const card = document.createElement("div");

card.className = "grid-item";

card.innerHTML = `

<h4>${db}</h4>

<p>Database</p>

`;

card.onclick = ()=>{

selectDatabase(db)

};

databaseList.appendChild(card);

});

hideLoader();

}


async function selectDatabase(db){

currentDB = db;

await loadTables();

}


async function createDatabase(name){

await fetch(

`${API}/databases/`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

name:name

})

}

);

toast("Database Created");

loadDatabases();

}



/***************************
TABLES
****************************/

async function loadTables(){

if(!currentDB) return;

const res = await fetch(

`${API}/databases/${currentDB}/tables`

);

const data = await res.json();

tableList.innerHTML = "";

tableCount.innerText = data.length;

data.forEach(table=>{

const div = document.createElement("div");

div.className = "grid-item";

div.innerHTML = `

<h4>${table}</h4>

<p>CSV Table</p>

`;

div.onclick = ()=>{

selectTable(table)

};

tableList.appendChild(div);

});

}


async function selectTable(table){

currentTable = table;

loadRows();

}


async function createTable(

table,

columns

){

await fetch(

`${API}/databases/${currentDB}/tables`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

table:table,

columns:columns

})

}

);

toast("Table Created");

loadTables();

}



/***************************
ROWS
****************************/

async function loadRows(){

if(!currentTable) return;

const res = await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows`

);

const rows = await res.json();

currentRows = rows;

rowCount.innerText = rows.length;

renderRows(rows);

}


function renderRows(rows){

tableHead.innerHTML = "";

tableBody.innerHTML = "";

if(rows.length===0){

return;

}

const cols = Object.keys(rows[0]);

let th = "<tr>";

cols.forEach(c=>{

th += `<th>${c}</th>`;

});

th += "<th>Actions</th>";

th += "</tr>";

tableHead.innerHTML = th;


rows.forEach(row=>{

let tr = "<tr>";

cols.forEach(c=>{

tr += `

<td>

${row[c]}

</td>

`;

});

tr += `

<td>

<button onclick="editRow('${row.id}')">

Edit

</button>

<button onclick="deleteRow('${row.id}')">

Delete

</button>

</td>

`;

tr += "</tr>";

tableBody.innerHTML += tr;

});

}



/***************************
ADD ROW
****************************/

async function addRow(data){

await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(data)

}

);

toast("Row Added");

loadRows();

}



/***************************
UPDATE
****************************/

async function updateRow(

id,

data

){

await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows/${id}`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(data)

}

);

toast(

"Row Updated"

);

loadRows();

}



/***************************
DELETE
****************************/

async function deleteRow(id){

if(

!confirm(

"Delete Row ?"

)

)

return;

await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows/${id}`,

{

method:"DELETE"

}

);

toast(

"Deleted"

);

loadRows();

}


async function deleteTable(table){

await fetch(

`${API}/databases/${currentDB}/tables/${table}`,

{

method:"DELETE"

}

);

toast(

"Table Deleted"

);

loadTables();

}



async function deleteDatabase(db){

await fetch(

`${API}/databases/${db}`,

{

method:"DELETE"

}

);

toast(

"Database Deleted"

);

loadDatabases();

}



/***************************
BUTTONS
****************************/

document.getElementById(

"refreshBtn"

).onclick=()=>{

loadDatabases();

};



document.getElementById(

"createDbBtn"

).onclick=()=>{

openModal(

"Create Database",

`

<input id="dbName">

`,

()=>{

const name=

document.getElementById(

"dbName"

).value;

createDatabase(name);

closeModal();

}

);

};



/***************************
INIT
****************************/

loadDatabases();

