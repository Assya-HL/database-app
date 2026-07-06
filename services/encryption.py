from cryptography.fernet import Fernet
import hashlib
import os

KEY_FILE = "secret.key"


def load_key():

    if not os.path.exists(KEY_FILE):

        key = Fernet.generate_key()

        with open(KEY_FILE, "wb") as f:

            f.write(key)


    with open(KEY_FILE, "rb") as f:
        
        return f.read()


key = load_key()

cipher = Fernet(key)


def encrypt(text):

    return cipher.encrypt(

        str(text).encode()

    ).decode()


def decrypt(text):

    return cipher.decrypt(

        text.encode()

    ).decode()


def encrypt_db_name(name):

    return hashlib.sha256(

        name.encode()

    ).hexdigest()


def decrypt_db_name(name):

    return name


def encrypt_table_name(name):

    return hashlib.sha256(

        name.encode()

    ).hexdigest()


def decrypt_table_name(name):

    return name