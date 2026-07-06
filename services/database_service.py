import os
import csv
import json
import shutil
import subprocess

from services.encryption import (
    encrypt,
    decrypt,
    encrypt_db_name,
    encrypt_table_name
)

DATABASE_DIR = "database"
META = "database/metadata.json"

os.makedirs(DATABASE_DIR, exist_ok=True)


def load_meta():

    if not os.path.exists(META):

        with open(META, "w") as f:

            json.dump({}, f)

    with open(META, "r") as f:

        return json.load(f)


def save_meta(data):

    with open(META, "w") as f:

        json.dump(

            data,

            f,

            indent=4

        )


def create_database(name):

    meta = load_meta()

    if name in meta:

        return {

            "message": "Database already exists"

        }

    enc = encrypt_db_name(name)

    path = os.path.join(

        DATABASE_DIR,

        enc

    )

    os.makedirs(path)

    open(

        os.path.join(

            path,

            ".gitkeep"

        ),

        "w"

    ).close()

    meta[name] = {

        "encrypted": enc,

        "tables": {}

    }

    save_meta(meta)

    sync_git(

        f"Create database {name}"

    )

    return {

        "message": "Database created"

    }


def list_databases():

    meta = load_meta()

    return list(

        meta.keys()

    )


def delete_database(name):

    meta = load_meta()

    if name not in meta:

        return {

            "message": "Database not found"

        }

    enc = meta[name]["encrypted"]

    shutil.rmtree(

        os.path.join(

            DATABASE_DIR,

            enc

        )

    )

    del meta[name]

    save_meta(meta)

    sync_git(

        f"Delete database {name}"

    )

    return {

        "message": "Database deleted"

    }


def create_table(db, table, columns):

    meta = load_meta()

    if db not in meta:

        return {

            "message": "Database not found"

        }

    enc_db = meta[db]["encrypted"]

    enc_table = encrypt_table_name(table)

    db_path = os.path.join(

        DATABASE_DIR,

        enc_db

    )

    file = os.path.join(

        db_path,

        f"{enc_table}.csv"

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

    meta[db]["tables"][table] = enc_table

    save_meta(meta)

    sync_git(

        f"Create table {table}"

    )

    return {

        "message": "Table created"

    }


def list_tables(db):

    meta = load_meta()

    if db not in meta:

        return {

            "message": "Database not found"

        }

    return list(

        meta[db]["tables"].keys()

    )


def delete_table(db, table):

    meta = load_meta()

    if db not in meta:

        return {

            "message": "Database not found"

        }

    if table not in meta[db]["tables"]:

        return {

            "message": "Table not found"

        }

    enc_db = meta[db]["encrypted"]

    enc_table = meta[db]["tables"][table]

    file = os.path.join(

        DATABASE_DIR,

        enc_db,

        f"{enc_table}.csv"

    )

    os.remove(file)

    del meta[db]["tables"][table]

    save_meta(meta)

    sync_git(

        f"Delete table {table}"

    )

    return {

        "message": "Table deleted"

    }


def insert_row(db, table, row):

    meta = load_meta()

    enc_db = meta[db]["encrypted"]

    enc_table = meta[db]["tables"][table]

    file = os.path.join(

        DATABASE_DIR,

        enc_db,

        f"{enc_table}.csv"

    )

    if not os.path.exists(file):

        return {

            "message": "Table not found"

        }

    encrypted = []

    for value in row.values():

        encrypted.append(

            encrypt(value)

        )

    with open(

            file,

            "a",

            newline="",

            encoding="utf-8"

    ) as f:

        writer = csv.writer(f)

        writer.writerow(

            encrypted

        )

    sync_git(

        f"Insert row in {table}"

    )

    return {

        "message": "Row inserted"

    }


def get_rows(db, table):

    meta = load_meta()

    enc_db = meta[db]["encrypted"]

    enc_table = meta[db]["tables"][table]

    file = os.path.join(

        DATABASE_DIR,

        enc_db,

        f"{enc_table}.csv"

    )

    rows = []

    with open(

            file,

            "r",

            encoding="utf-8"

    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            item = {}

            for k, v in row.items():

                item[k] = decrypt(v)

            rows.append(

                item

            )

    return rows


def update_row(db, table, row_id, new_data):

    meta = load_meta()

    enc_db = meta[db]["encrypted"]

    enc_table = meta[db]["tables"][table]

    file = os.path.join(

        DATABASE_DIR,

        enc_db,

        f"{enc_table}.csv"

    )

    rows = []

    with open(

            file,

            "r",

            encoding="utf-8"

    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            if decrypt(

                    row["id"]

            ) == str(row_id):

                for k, v in new_data.items():

                    row[k] = encrypt(v)

            rows.append(

                row

            )

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

        writer.writerows(

            rows

        )

    sync_git(

        f"Update row {row_id}"

    )

    return {

        "message": "Row updated"

    }


def delete_row(db, table, row_id):

    meta = load_meta()

    enc_db = meta[db]["encrypted"]

    enc_table = meta[db]["tables"][table]

    file = os.path.join(

        DATABASE_DIR,

        enc_db,

        f"{enc_table}.csv"

    )

    rows = []

    with open(

            file,

            "r",

            encoding="utf-8"

    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            if decrypt(

                    row["id"]

            ) != str(row_id):

                rows.append(

                    row

                )

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

        writer.writerows(

            rows

        )

    sync_git(

        f"Delete row {row_id}"

    )

    return {

        "message": "Row deleted"

    }


def sync_git(message):

    subprocess.run(

        ["git", "add", "."]

    )

    subprocess.run(

        [

            "git",

            "commit",

            "-m",

            message

        ],

        capture_output=True

    )

    subprocess.run(

        [

            "git",

            "push"

        ],

        capture_output=True

    )

