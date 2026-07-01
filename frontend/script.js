const API = "http://127.0.0.1:8001";

window.onload = () => {
    loadDBs();
};

async function createDB() {

    const name = document.getElementById("dbname").value;

    if (!name) {
        alert("Enter database name");
        return;
    }

    const response = await fetch(`${API}/databases/`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name
        })

    });

    const data = await response.json();

    alert(data.message);

    document.getElementById("dbname").value = "";

    await loadDBs();

}


async function loadDBs() {

    const response = await fetch(

        `${API}/databases/`

    );

    const data = await response.json();

    const list = document.getElementById(

        "databases"

    );

    list.innerHTML = "";

    for (let db of data) {

        const li = document.createElement("li");

        li.textContent = db;

        list.appendChild(li);

    }

}