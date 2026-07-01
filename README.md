# Database Application

Application de gestion de bases de données avec FastAPI.

## Concept

Database = Dossier

Table = Fichier CSV

Colonnes = Header CSV

## Fonctionnalités

- Create Database
- List Databases
- Delete Database

- Create Table
- List Tables
- Delete Table

- Insert Row
- Read Rows
- Update Row
- Delete Row

## Exécution

```bash
python -m uvicorn main:app --reload
```

Swagger :

http://127.0.0.1:8001/docs