// pachete
const express = require('express');
const mysql2 = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();

// conexiune
const database = mysql2.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'MYSQL_2003',
        database: 'dailyglow_db'
    }
)

// verificam conexiunea
database.connect((err) => {
    if (err) {
        console.error('Eroare la conectarea cu baza de date', err);
    } else {
        console.log('Conectat ✅');
    }
    });

// pt gestionarea datelor din formular
app.use(express.urlencoded({ extended: true }));

app.post('/signup', (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    // verificam daca pw sunt identice
    if (password !== confirm_password) {
        return res.status(400).send('Parolele nu sunt identice.');
    }

    // verificam daca email-ul exista
    database.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).send('Eroare la interogarea bazei de date.');
        }
        if (result.length > 0) {
            return res.status(400).send('Email-ul deja inregistrat.');
        }

        // criptam pw
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).send('Eroare la criptarea parolei.');
            }

            // inseram user-ul in baza de date
            const query = 'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())';
            database.query(query, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Eroare la inserarea utilizatorului:', err);
                    return res.status(500).send('Eroare la înregistrare.');
                } else {
                    console.log('Utilizator înregistrat ✅', result.insertId);
                    res.send('Înregistrare cu succes!');
                }
            });
        });
    });
});

// start server
app.listen(3000, () => {
    console.log('Serverul rulează pe http://localhost:3000');
});