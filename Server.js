const express = require('express');
const Datastore = require('nedb-revived'); // ఉచిత డేటాబేస్ యాడ్ చేసాం
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// ఆటోమేటిక్‌గా ఆర్డర్లు సేవ్ అవ్వడానికి 'orders.db' అనే ఫైల్ క్రియేట్ అవుతుంది
const db = new Datastore({ filename: 'orders.db', autoload: true });

// ⚠️ మీ బిజినెస్ UPI వివరాలు ఇక్కడ మార్చండి
const MY_UPI_ID = "vishnualloju@ybl"; // మీ UPI ID ఇక్కడ ఇవ్వండి
const MERCHANT_NAME = "Chapathi.com Kitchen"; // మీ బిజినెస్ పేరు

app.post('/api/create-upi-pay', (req, res) => {
    const { amount, phone, address } = req.body;

    if (!amount || !phone || !address) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    const transactionId = "TXN" + Date.now();
    const orderDate = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}); // ఇండియా టైం ప్రకారం డేట్

    // 1. డేటాబేస్ లో సేవ్ చేయడానికి కస్టమర్ డేటా స్ట్రక్చర్
    const orderData = {
        _id: transactionId,
        customerPhone: phone,
        deliveryAddress: address,
        billAmount: amount,
        paymentStatus: "Pending", // మొదట పెండింగ్ అని ఉంటుంది
        date: orderDate
    };

    // 2. కస్టమర్ డేటాను 'orders.db' ఫైల్ లోకి సేవ్ చేసే లాజిక్
    db.insert(orderData, (err, newDoc) => {
        if (err) {
            console.error("డేటాబేస్ లో సేవ్ చేయడంలో సమస్య వచ్చింది:", err);
        } else {
            console.log(`✅ కస్టమర్ డేటా భద్రపరచబడింది: ID ${transactionId} - Mobile: ${phone}`);
        }
    });

    // UPI లింక్ జనరేషన్
    const note = `Chapathi Order from ${phone}`;
    const upiUrl = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tr=${transactionId}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    res.json({ upiUrl: upiUrl });
});

app.listen(PORT, () => {
    console.log(`Chapathi App Server with Database running beautifully on port ${PORT}`);
});
