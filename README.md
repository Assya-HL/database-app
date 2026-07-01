# Database Application

Application de gestion de bases de données avec FastAPI.

## Concept

* Database = Dossier
* Table = Fichier CSV
* Colonnes = Header CSV

## Fonctionnalités

* Créer une base de données

* Lister les bases de données

* Supprimer une base de données

* Créer une table

* Lister les tables

* Supprimer une table

* Insérer une ligne

* Lire les lignes

* Modifier une ligne

* Supprimer une ligne

## Stockage

* Les bases de données sont stockées dans le dossier `database/`
* Chaque base de données est représentée par un dossier
* Chaque table est représentée par un fichier CSV
* Les colonnes sont stockées dans la première ligne du fichier CSV
* Les modifications sont synchronisées avec GitHub après chaque opération

## Exécution

```bash
python -m uvicorn main:app --reload
```

## Swagger

```text
http://127.0.0.1:8001/docs
```
