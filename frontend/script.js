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


function showLoader(){

loader.style.display="flex";

}

function hideLoader(){

loader.style.display="none";

}


function toast(msg){

const container =
document.getElementById(
"toastContainer"
);

const div =
document.createElement(
"div"
);

div.className="toast";

div.innerText=msg;

container.appendChild(div);

setTimeout(()=>{

div.remove();

},3000);

}



function openModal(

title,

html,

callback

){

modal.classList.remove(

"hidden"

);

modalTitle.innerText = title;

modalBody.innerHTML = html;

modalAction = callback;

}



function closeModal(){

modal.classList.add(

"hidden"

);

}


closeModalBtn.onclick=closeModal;

cancelBtn.onclick=closeModal;

saveBtn.onclick=()=>{

if(modalAction){

modalAction();

}

};
async function loadDatabases(){

showLoader();

const res = await fetch(

`${API}/databases/`

);

const data = await res.json();

databaseList.innerHTML="";

dbCount.innerText=data.length;

data.forEach(db=>{

const card = document.createElement(

"div"

);

card.className="grid-item";

card.innerHTML=`

<h4>${db}</h4>

<p>Database</p>

<button

class="btn"

onclick="event.stopPropagation(); deleteDatabase('${db}')"

>

Delete

</button>

`;

card.onclick=()=>{

selectDatabase(db)

};

databaseList.appendChild(card);

});

hideLoader();

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

toast(

"Database Created"

);

loadDatabases();

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



async function selectDatabase(db){

currentDB = db;

loadTables();

}
async function loadTables(){

if(!currentDB)

return;

const res = await fetch(

`${API}/databases/${currentDB}/tables`

);

const data = await res.json();

tableList.innerHTML="";

tableCount.innerText=data.length;

data.forEach(table=>{

const div=document.createElement(

"div"

);

div.className="grid-item";

div.innerHTML=`

<h4>${table}</h4>

<p>CSV Table</p>

<button

class="btn"

onclick="event.stopPropagation(); deleteTable('${table}')"

>

Delete

</button>

`;

div.onclick=()=>{

selectTable(table)

};

tableList.appendChild(div);

});

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

table,

columns

})

}

);

toast(

"Table Created"

);

loadTables();

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



async function selectTable(table){

currentTable = table;

loadRows();

}
async function loadRows(){

if(!currentTable)

return;

const res = await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows`

);

const rows = await res.json();

currentRows = rows;

rowCount.innerText = rows.length;

renderRows(rows);

}



function renderRows(rows){

tableHead.innerHTML="";

tableBody.innerHTML="";

if(rows.length===0)

return;

const cols = Object.keys(

rows[0]

);

let th="<tr>";

cols.forEach(c=>{

th+=`<th>${c}</th>`;

});

th+="<th>Actions</th>";

th+="</tr>";

tableHead.innerHTML=th;


rows.forEach(row=>{

let tr="<tr>";

cols.forEach(c=>{

tr+=`

<td>

${row[c]}

</td>

`;

});

tr+=`

<td>

<button

onclick="editRow('${row.id}')"

>

Edit

</button>

<button

onclick="deleteRow('${row.id}')"

>

Delete

</button>

</td>

`;

tr+="</tr>";

tableBody.innerHTML+=tr;

});

}
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

toast(

"Row Added"

);

loadRows();

}



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

"Updated"

);

loadRows();

}



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

<input

id="dbName"

placeholder="Database Name"

>

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



document.getElementById(

"addTable"

).onclick=()=>{

if(!currentDB){

toast(

"Select Database"

);

return;

}

openModal(

"Create Table",

`

<input

id="tableName"

placeholder="Table"

>

<input

id="columns"

placeholder="id,name,email"

>

`,

()=>{

const table=

document.getElementById(

"tableName"

).value;

const cols=

document.getElementById(

"columns"

)

.value

.split(",");

createTable(

table,

cols

);

closeModal();

}

);

};



document.getElementById(

"addRow"

).onclick=()=>{

if(!currentTable){

toast(

"Select Table"

);

return;

}

let html="";

const cols = currentRows.length

?

Object.keys(

currentRows[0]

)

:

["id"];

cols.forEach(c=>{

html+=`

<input

id="${c}"

placeholder="${c}"

>

`;

});

openModal(

"Add Row",

html,

()=>{

const data={};

cols.forEach(c=>{

data[c]=

document.getElementById(

c

).value;

});

addRow(data);

closeModal();

}

);

};
function editRow(id){

const row = currentRows.find(

r=>r.id==id

);

if(!row){

toast(

"Not Found"

);

return;

}

let html="";

Object.keys(row).forEach(c=>{

html+=`

<input

id="${c}"

value="${row[c]}"

>

`;

});

openModal(

"Edit Row",

html,

()=>{

const data={};

Object.keys(row)

.forEach(c=>{

data[c]=

document.getElementById(

c

).value;

});

updateRow(

id,

data

);

closeModal();

}

);

}



document.getElementById(

"exportBtn"

).onclick=()=>{

if(!currentRows.length)

return;

const cols=

Object.keys(

currentRows[0]

);

let csv=

cols.join(",");

csv+="\n";

currentRows.forEach(r=>{

csv+=Object.values(

r

).join(",");

csv+="\n";

});

const blob=new Blob(

[csv],

{

type:"text/csv"

}

);

const a=

document.createElement(

"a"

);

a.href=

URL.createObjectURL(

blob

);

a.download=

currentTable+".csv";

a.click();

};



loadDatabases();