import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data arrayer
let users = [];
let accounts = [];
let sessions = [];

// Generera engångslösenord
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

// Skapa användare (POST)
app.post('/users', (req, res) => {
    const { username, password } = req.body;
    // Skapa användare och bankkonto
    const userId = users.length + 1;
    users.push({ id: userId, username, password });
    accounts.push({ id: userId, userId, amount: 0 });
    res.status(201).json({ message: 'User created successfully' });
});

// Logga in (POST)
app.post('/sessions', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    } else{
    const token = generateOTP();
    sessions.push({ userId: user.id, token });
    res.json({ token });
    };
});

// Visa saldo (POST)
app.post('/accounts', (req, res) => {
    const { token } = req.body;
    const session = sessions.find((session) => session.token === token);
    if (!session) {
        res.status(401).json({ message: 'Invalid token' });
    }else{
        const account = accounts.find((account) => account.userId === session.userId);
        res.json({ amount: account.amount });
    }
});

// Sätt in pengar (POST)
app.post('/me/accounts/transactions', (req, res) => {
    const { token, amount } = req.body;
    const session = sessions.find((session) => session.token === token);
    if (!session) {
        res.status(401).json({ message: 'Invalid token' });
    }else{
        const account = accounts.find((account) => account.userId === session.userId);
        account.amount += amount;
        res.json({ message: 'Money deposited successfully' });
    }
});


// Starta servern
const port = 3001;
app.listen(port, () => {
    console.log(`Bankens backend körs på http://localhost:${port}`);
});
