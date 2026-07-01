const API = "http://127.0.0.1:8001";

console.log("JS Loaded");

window.onload = function () {
    loadDBs();
};

async function createDB() {

    const name = document.getElementById("dbname").value.trim();

    if (name === "") {

        alert("Enter database name");

        return;

    }

    try {

        const response = await fetch(

            `${API}/databases/`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    name: name

                })

            }

        );

        const data = await response.json();

        alert(data.message);

        document.getElementById("dbname").value = "";

        loadDBs();

    }

    catch (error) {

        console.error(error);

        alert("Cannot connect to API");

    }

}

async function loadDBs() {

    try {

        const response = await fetch(

            `${API}/databases/`

        );

        const data = await response.json();

        const list = document.getElementById(

            "databases"

        );

        list.innerHTML = "";

        data.forEach(db => {

            list.innerHTML += `

            <li>

                ${db}

            </li>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}