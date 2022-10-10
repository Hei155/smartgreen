const { NODE_ENV } = process.env;
const mongoose = require('mongoose');
const reader = require('xlsx');
const excel = require('exceljs');
const workbook = new excel.Workbook();
const { MONGO_LINK } = NODE_ENV === 'production' ? process.env : require('./utils/config')

async function start() {
    try {
        await mongoose.connect(MONGO_LINK, {
            useNewUrlParser: false,
        })
        console.log('БД успешна подключена!')
    } catch(e) {
        console.log(e);
    }
}

function deltaTime(t1, t0) {
    let delta;
    if (Number(t1[1]) > Number(t0[1]) || Number(t1[0]) > Number(t0[0])) {
        delta = Number(t1[2]) + (60 - Number(t0[2]));
        return delta;
    }
    return delta = Number(t1[2]) - Number(t0[2]);
}

const file = reader.readFile('./Navigatsionnye_dannye_i_otmetki_vykhoda_s_18_06_2022_po_16_08_2022/Навигационные данные 01.07.2022.xlsx');

let data = [];
const processedData = [];

const sheets = file.SheetNames

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
            data.push({'row': count, 't0': date0, 't1': date1, 't': deltaTime(date1, date0), 'l': temp[j].__EMPTY_14, 'v0': temp[j].__EMPTY_4, 'v1': v1, 'vMax': temp[j].__EMPTY_13})
        }
        count++;
    }
}


function calculation({row, t, l, v0, v1, vMax}) {
    let vr = (vMax + v0)/(2*3.6);
    let vp = vMax/3.6;
    let vt = (vMax+v1)/(2*3.6);
    let vAverageValue = l/t;
    let tr;
    let tp;
    let tt;
    let ar;
    let at;
    if (v0 != vMax && v1 != vMax && v0,v1,vMax>0) {
        if (vAverageValue > v0 && vAverageValue > v1) {
            let a = (vMax-v0)*(vr-vp);
            let b = (vMax-v1)*(vt-vp);
            let c = 4*(2*vAverageValue-v0-v1)/t;
            let befB = (a-b+c*(l-vp*t))/(vp*t-l);
            let befC = (a*c)/(vp*t-l);
            discriminant = befB**2-4*(-befC);
            let x1 = (-b + discriminant**(1/2))/(2*a);
            let x2 = (-b - discriminant**(1/2))/(2*a);
            if (x1 > x2) {
                ar = x1;
            } else {
                ar = x2;
            }
            at = c-ar;
            tr = (vMax-v0)/ar;
            tt = (vMax-v1)/at;
            tp = t-tr-tt;
            if (row === 4118) {
                console.log(discriminant)
                console.log(a)
                console.log(b)
                console.log(c)
                console.log(befB)
                console.log(befC)
                console.log(x1,x2)
            }
        } else if (vAverageValue > v0 && vAverageValue <= v1) {
            delta = -(vMax-v1)*(vt-vp)/3.6;
            deltaAr = -((vMax-v1)*(vt-vp)/3.6)*(t/(2*(vAverageValue-v0)));
            deltaAt = (vMax-v0)*(vr-vp)/3.6*(t/(2*(vAverageValue-v0))) - (l-vp*t);
            ar = deltaAr/delta;
            at = deltaAt/delta;
            tr = (vMax-v0)/ar;
            tt = (vMax-v1)/at;
            tp = t - tr - tt;
        } else if (vAverageValue <= v0 && vAverageValue > v1) {
            delta = (vMax-v0)*(vr-vp)/3.6;
            deltaAr = (l-vp*t) - ((vMax-v1)*(vt-vp)/3.6)*t/(2*(vAverageValue-v1));
            deltaAt = ((vMax-v0)*(vr-vp)/3.6)*(t/(2*(vAverageValue-v1)));
            ar = deltaAr/delta;
            at = deltaAt/delta;
            tr = (vMax-v0)/ar;
            tt = (vMax-v1)/at;
            tp = t - tr - tt;
        } else {
            ar = 'Пропущен алгоритмом';
            at = 'Пропущен алгоритмом';
            tr = 'Пропущен алгоритмом';
            tt = 'Пропущен алгоритмом';
            tp = 'Пропущен алгоритмом';
        }
    } else if (v0 == vMax && v1 != vMax){
            tp = t*((vAverageValue-vt)/(vp-vt))
            tt = t-tp
            tr = 0;
            at = (vMax-v1)/tt
    } else if(v1==vMax && v0 != vMax){
            tr = t*((vAverageValue-vp)/(vr-vp))
            tp = t - tr;
            tt = 0;
            ar = (vMax-v0)/tr;
    } else if (v0===v1 && v1===vMax && v0,v1,vMax>0) {
            tp=l/t;
            tr=0;
            tt=0;
    } else {
            tr=0;
            tt=0;
            tp=0;
    }
    processedData.push({'row': row, 'tr': tr, 'tt': tt, 'tp': tp, 'ar': ar, 'at': at})
}

data.forEach((dataBlock) => {
    calculation(dataBlock)
});

workbook.xlsx.readFile('./Navigatsionnye_dannye_i_otmetki_vykhoda_s_18_06_2022_po_16_08_2022/Навигационные данные 01.07.2022.xlsx')
    .then(() => {
        const title = workbook.getWorksheet(1).getRow(7);
        title.getCell(28).value = 'tr';
        title.getCell(29).value = 'tt';
        title.getCell(30).value = 'tp';
        title.getCell(31).value = 'ar';
        title.getCell(32).value = 'at';
        for (let i = 0; i < processedData.length; i++) {
            var worksheet = workbook.getWorksheet(1);
            var row = worksheet.getRow(i+8);
            row.getCell(28).value = processedData[i].tr;
            row.getCell(29).value = processedData[i].tt;
            row.getCell(30).value = processedData[i].tp;
            row.getCell(31).value = processedData[i].ar;
            row.getCell(32).value = processedData[i].at;
        }
        row.commit();
        return workbook.xlsx.writeFile('new.xlsx');
    })

    data.forEach((d) => {
        if (d.row === 4118) {
            console.log(d)
        }
    })