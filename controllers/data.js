const Data = require('../models/data');
const reader = require('xlsx');

const setData = (req, res, next) => {
    console.log(req.body)
    Data.create({...req.body})
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((e) => {
            next(e);
        });
}

const calculation = (req, res, next) => {
    const file = reader.readFile('./requestsBuffer/new.xlsx');
    const sheets = file.SheetNames;

    let firstData = [];
    const processedData = [];

    function deltaTime(t1, t0) {
        let delta;
        if (Number(t1[1]) > Number(t0[1]) || Number(t1[0]) > Number(t0[0])) {
            delta = Number(t1[2]) + (60 - Number(t0[2]));
            return delta;
        }
        return delta = Number(t1[2]) - Number(t0[2]);
    }
    
    for(let i = 0; i < sheets.length; i++) {
        let count = 3;
        const temp = reader.utils.sheet_to_json(file.Sheets[sheets[i]])
        for (let j = 0; j < temp.length; j++) {
            let a = file.Sheets[sheets[i]][`A${count}`];
            let b = file.Sheets[sheets[i]][`A${count - 1}`];
            let v1;
            if (file.Sheets[sheets[i]][`F${count - 1}`]) {
                v1 = file.Sheets[sheets[i]][`F${count - 1}`].v
            } else {
                v1 = 0;
            }
            if (typeof temp[j].__EMPTY_7 == 'number' && a && j > 4) {
                let date0 = a.v.split(' ')[1].split(':')
                let date1 = b.v.split(' ')[1].split(':')
                firstData.push({'row': count, 'distance': temp[j].__EMPTY_6, 't': deltaTime(date1, date0), 'l': temp[j].__EMPTY_14, 'v0': temp[j].__EMPTY_4, 'v1': v1, 'vMax': temp[j].__EMPTY_13, 'latitude': temp[j].__EMPTY_2, 'longitude': temp[j].__EMPTY_1})
            }
            count++;
        }
    }
    function calculation({row, t, l, v0, v1, vMax, distance, latitude, longitude}) {
        let nx;
        let mi = 2640;
        let kz = 1;
        let kv = 1;
        let kFuel = 1;
        let consum;
        let us;
        let usPas;
        if (v0===v1 && v1 === vMax && vMax === 0 && l === 0) {
            nx = 2;
            kv = 1;
            consum = (t * nx)/3600;
            us = consum * mi * kz * kv * kFuel;
            usPas = consum * mi * kz * 0 * kFuel;        
        } else {
            nx = 0.00027;
            consum = nx * l;
            let kzPas = 0.0051;
            us = consum * mi * kz * kv * kFuel;
            usPas = consum * mi * kzPas * kv * kFuel;
        }
        processedData.push({'row': row, 'distance': distance, 'us': us, 'usPas': usPas, 'consum': consum, 'latitude': latitude, 'longitude': longitude})
    }

    firstData.forEach(block => calculation(block));
    res.status(200).send(processedData)
}

const confirmData = (req, res, next) => {
    fileConfirm(req, res)
        .then(res => res.status(200).send(req.body))
        .catch(e => next(e))
}

function fileConfirm(req, res, next) {
    return new Promise((resolve, reject) => {
        if (req.body) {
            resolve(res);
        } else {
            const error = new Error('Ошибка загрузки файла');
            error.code = 500;
            reject(error)
        }
    })
}

module.exports = { 
    setData,
    calculation,
    confirmData,
};