const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', transactionsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
