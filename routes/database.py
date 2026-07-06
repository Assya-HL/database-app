
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

from services.database_service import *

router = APIRouter(

    prefix="/databases",

    tags=["Databases"]

)


class Database(BaseModel):

    name: str


class Table(BaseModel):

    table: str

    columns: list[str]


@router.post("/")

def create_db(db: Database):

    return create_database(

        db.name

    )


@router.get("/")

def get_databases():

    return list_databases()


@router.delete("/{db}")

def remove_database(db):

    return delete_database(

        db

    )


@router.post("/{db}/tables")

def add_table(

        db,

        table: Table

):

    return create_table(

        db,

        table.table,

        table.columns

    )


@router.get("/{db}/tables")

def get_tables(db):

    return list_tables(

        db

    )


@router.delete("/{db}/tables/{table}")

def remove_table(

        db,

        table

):

    return delete_table(

        db,

        table

    )


@router.post("/{db}/{table}/rows")

def add_row(

        db,

        table,

        row: Dict

):

    return insert_row(

        db,

        table,

        row

    )


@router.get("/{db}/{table}/rows")

def read_rows(

        db,

        table

):

    return get_rows(

        db,

        table

    )


@router.put("/{db}/{table}/rows/{id}")

def modify_row(

        db,

        table,

        id,

        row: Dict

):

    return update_row(

        db,

        table,

        id,

        row

    )


@router.delete("/{db}/{table}/rows/{id}")

def remove_row(

        db,

        table,

        id

):

    return delete_row(

        db,

        table,

        id

    )
