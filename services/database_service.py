import os
import csv
import shutil
import subprocess

DATABASE_DIR = "database"

os.makedirs(DATABASE_DIR, exist_ok=True)


def create_database(name):

    path = os.path.join(
        DATABASE_DIR,
        name
    )

    if os.path.exists(path):

        return {
            "message": "Database already exists"
        }

    os.makedirs(path)

    sync_git(

    f"Create database {name}"

)

    return {
        "message": "Database created"
    }


def list_databases():

    return os.listdir(DATABASE_DIR)


def delete_database(name):

    path = os.path.join(
        DATABASE_DIR,
        name
    )

    if not os.path.exists(path):

        return {
            "message": "Database not found"
        }

    shutil.rmtree(path)

    sync_git(

    f"Delete database {name}"

)

    return {
        "message": "Database deleted"
    }


def create_table(db, table, columns):

    db_path = os.path.join(

        DATABASE_DIR,

        db

    )

    if not os.path.exists(db_path):

        return {

            "message": "Database not found"

        }

    file = os.path.join(

        db_path,

        f"{table}.csv"

    )

    if os.path.exists(file):

        return {

            "message": "Table already exists"

        }

    with open(

            file,

            "w",

            newline="",

            encoding="utf-8"

    ) as f:

        writer = csv.writer(f)

        writer.writerow(columns)

    sync_git(

    f"Create table {table}"

) 

    return {

        "message": "Table created"

    }


def list_tables(db):

    path = os.path.join(

        DATABASE_DIR,

        db

    )

    if not os.path.exists(path):

        return {

            "message": "Database not found"

        }

    tables = []

    for f in os.listdir(path):

        if f.endswith(".csv"):

            tables.append(

                f.replace(".csv", "")

            )

    return tables


def delete_table(db, table):

    file = os.path.join(

        DATABASE_DIR,

        db,

        f"{table}.csv"

    )

    if not os.path.exists(file):

        return {

            "message": "Table not found"

        }

    os.remove(file)

    sync_git(

    f"Delete table {table}"

)

    return {

        "message": "Table deleted"

    }


def insert_row(db, table, row):

    file = os.path.join(

        DATABASE_DIR,

        db,

        f"{table}.csv"

    )

    if not os.path.exists(file):

        return {

            "message": "Table not found"

        }

    with open(

            file,

            "a",

            newline="",

            encoding="utf-8"

    ) as f:

        writer = csv.writer(f)

        writer.writerow(row.values())

    sync_git(

    f"Insert row in {table}"

)

    return {

        "message": "Row inserted"

    }


def get_rows(db, table):

    file = os.path.join(

        DATABASE_DIR,

        db,

        f"{table}.csv"

    )

    if not os.path.exists(file):

        return {

            "message": "Table not found"

        }

    rows = []

    with open(

            file,

            "r",

            encoding="utf-8"

    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            rows.append(row)

    return rows


def update_row(db, table, row_id, new_data):

    file = os.path.join(

        DATABASE_DIR,

        db,

        f"{table}.csv"

    )

    if not os.path.exists(file):

        return {

            "message": "Table not found"

        }

    rows = []

    with open(

            file,

            "r",

            encoding="utf-8"

    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            if row["id"] == str(row_id):

                row.update(new_data)

            rows.append(row)

    if not rows:

        return {

            "message": "No rows found"

        }

    with open(

            file,

            "w",

            newline="",

            encoding="utf-8"

    ) as f:

        writer = csv.DictWriter(

            f,

            fieldnames=rows[0].keys()

        )

        writer.writeheader()

        writer.writerows(rows)

    sync_git(

    f"Update row {row_id}"

)

    return {

        "message": "Row updated"

    }


def delete_row(db, table, row_id):

    file = os.path.join(

        DATABASE_DIR,

        db,

        f"{table}.csv"

    )

    if not os.path.exists(file):

        return {

            "message": "Table not found"

        }

    rows = []

    with open(

            file,

            "r",

            encoding="utf-8"

    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            if row["id"] != str(row_id):

                rows.append(row)

    with open(

            file,

            "w",

            newline="",

            encoding="utf-8"

    ) as f:

        if rows:

            writer = csv.DictWriter(

                f,

                fieldnames=rows[0].keys()

            )

            writer.writeheader()

            writer.writerows(rows)

    sync_git(

    f"Delete row {row_id}"

)

    return {

        "message": "Row deleted"

    }
def sync_git(message):

    subprocess.run(["git", "add", "."])

    subprocess.run(

        ["git", "commit", "-m", message],

        capture_output=True

    )

    subprocess.run(

        ["git", "push"],

        capture_output=True

    )
