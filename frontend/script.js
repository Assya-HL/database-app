const API = "http://127.0.0.1:8001";

let currentDB = "";

let currentTable = "";

async function loadDatabases(){

const res = await fetch(

`${API}/databases/`

);

const data = await res.json();

const list = document.getElementById(

'dbList'

);

list.innerHTML='';

data.forEach(db=>{

list.innerHTML += `

<li onclick="selectDB('${db}')">

${db}

</li>

`;

});

}

async function selectDB(db){

currentDB=db;

document.getElementById(

'currentDB'

).innerText=db;

loadTables();

}

async function createDatabasePrompt(){

let name=

prompt(

'Database name'

);

if(!name)return;

await fetch(

`${API}/databases/`,

{

method:'POST',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify({

name:name

})

}

);

loadDatabases();

}

async function deleteDB(db){

await fetch(

`${API}/databases/${db}`,

{

method:'DELETE'

}

);

loadDatabases();

}

async function loadTables(){

const res=

await fetch(

`${API}/databases/${currentDB}/tables`

);

const data=

await res.json();

const div=

document.getElementById(

'tables'

);

div.innerHTML='';

data.forEach(table=>{

div.innerHTML += `

<div class="card">

<h3>

${table}

</h3>

<button onclick="showRows('${table}')">

Open

</button>

<button class="delete"

onclick="deleteTable('${table}')">

Delete

</button>

</div>

`;

});

}

async function createTablePrompt(){

let table=

prompt(

'Table Name'

);

if(!table)return;

let cols=

prompt(

'Columns separated by comma'

);

const columns=

cols.split(',');

await fetch(

`${API}/databases/${currentDB}/tables`,

{

method:'POST',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify({

table:table,

columns:columns

})

}

);

loadTables();

}

async function deleteTable(table){

await fetch(

`${API}/databases/${currentDB}/tables/${table}`,

{

method:'DELETE'

}

);

loadTables();

}

async function showRows(table){

currentTable=table;

const res=

await fetch(

`${API}/databases/${currentDB}/${table}/rows`

);

const rows=

await res.json();

drawTable(rows);

}

function drawTable(rows){

const thead=

document.querySelector(

'#records thead'

);

const tbody=

document.querySelector(

'#records tbody'

);

thead.innerHTML='';

tbody.innerHTML='';

if(rows.length===0)return;

const cols=

Object.keys(rows[0]);

thead.innerHTML=

'<tr>'+cols.map(c=>

`<th>${c}</th>`

).join('')

+'<th>Actions</th></tr>';

rows.forEach(r=>{

tbody.innerHTML +=

'<tr>'

+

cols.map(c=>

`<td>${r[c]}</td>`

).join('')

+

`<td>

<button

class="edit"

onclick="editRow('${r.id}')">

Edit

</button>

<button

class="delete"

onclick="deleteRow('${r.id}')">

Delete

</button>

</td>`

+

'</tr>';

});

}

async function insertRowPrompt(){

const text=

prompt(

'JSON Row'

);

if(!text)return;

const row=

JSON.parse(text);

await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows`,

{

method:'POST',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify(

row

)

}

);

showRows(

currentTable

);

}

async function editRow(id){

const text=

prompt(

'New JSON'

);

if(!text)return;

const row=

JSON.parse(text);

await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows/${id}`,

{

method:'PUT',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify(

row

)

}

);

showRows(

currentTable

);

}

async function deleteRow(id){

await fetch(

`${API}/databases/${currentDB}/${currentTable}/rows/${id}`,

{

method:'DELETE'

}

);

showRows(

currentTable

);

}

loadDatabases();
