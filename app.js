const { NODE_ENV } = process.env;
const { PORT } = NODE_ENV === 'production' ? process.env : require('./utils/config');
const express = require('express');
const cors = require('cors');
const data = require('./routes/data');
const helper = require('./helper/helper');
const bodyParser = require('body-parser');

const app = express();

app.use(cors())
app.use(express.json());
app.use('/data', data);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(helper);
app.listen(PORT, () => {
    console.log('Запущен');
});

