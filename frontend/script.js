const API = "http://127.0.0.1:8001";

window.onload = function () {
    loadDBs();
};

async function createDB() {

    try {

        const name = document.getElementById("dbname").value.trim();

        if (name === "") {

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

        loadDBs();

    }

    catch (error) {

        console.log(error);

        alert("Error while creating database");

    }

}



awindow.onload = function () {
    loadDBs();
};

async function loadDBs() {

    console.log("Refresh clicked");

    const response = await fetch(
        `${API}/databases/`
    );

    const data = await response.json();

    const list = document.getElementById("databases");

    list.innerHTML = "";

    data.forEach(db => {

        list.innerHTML += `<li>${db}</li>`;

    });

}
document.getElementById("refreshBtn")
.addEventListener("click", loadDBs);