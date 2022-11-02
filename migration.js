const reader = require('xlsx');
const excel = require('exceljs');
const workbook = new excel.Workbook();
const fs = require('fs');
const api = require('./utils/api');

let files = fs.readdirSync('./files/');

let totalUs = 0;
let totalUsPas = 0;
let totalConsum = 0;
let usSum = 0;
let usPasSum = 0;
let consumSum = 0;

function deltaTime(t1, t0) {
    let delta;
    if (Number(t1[1]) > Number(t0[1]) || Number(t1[0]) > Number(t0[0])) {
        delta = Number(t1[2]) + (60 - Number(t0[2]));
        return delta;
    }
    return delta = Number(t1[2]) - Number(t0[2]);
}

files.forEach((file) => {
    let readFile = reader.readFile(`./files/${file}`);
    let firstData = [];
    const processedData = [];

    const sheets = readFile.SheetNames

    for(let i = 0; i < sheets.length; i++) {
        let count = 3;
        const temp = reader.utils.sheet_to_json(readFile.Sheets[sheets[i]])
        for (let j = 0; j < temp.length; j++) {
            let a = readFile.Sheets[sheets[i]][`A${count}`];
            let b = readFile.Sheets[sheets[i]][`A${count - 1}`];
            let v1;
            if (readFile.Sheets[sheets[i]][`F${count - 1}`]) {
                v1 = readFile.Sheets[sheets[i]][`F${count - 1}`].v
            } else {
                v1 = 0;
            }
            if (typeof temp[j].__EMPTY_7 == 'number' && a && j > 4) {
                let date0 = a.v.split(' ')[1].split(':')
                let date1 = b.v.split(' ')[1].split(':')
                firstData.push({'row': count, 't0': date0, 't1': date1, 't': deltaTime(date1, date0), 'l': temp[j].__EMPTY_14, 'v0': temp[j].__EMPTY_4, 'v1': v1, 'vMax': temp[j].__EMPTY_13})
            }
            count++;
        }
    }
    function calculation({row, t, l, v0, v1, vMax}) {
        let nx;
        let mi = 2640;
        let kz = 1;
        let kv = 1;
        let kFuel = 1;
        let consum;
        let us;
        let usPas;
        let vr = (vMax + v0)/(2*3.6);
        let vp = vMax/3.6;
        let vt = (vMax+v1)/(2*3.6);
        let vAverageValue = l/t;
        let tr;
        let tp;
        let tt;
        let ar;
        let at;
        if (v0 !== vMax && v1 !== vMax && v0,v1,vMax>0) {
            if (vAverageValue > v0 && vAverageValue > v1) {
                let a = Math.abs((vMax-v0)*(vr-vp));
                let b = Math.abs((vMax-v1)*(vt-vp));
                let c = Math.abs(4*(2*vAverageValue-v0-v1)/t);
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
                tr = 0;
                tt = 0;
                tp = 0;
                ar = 0;
                at = 0;
            }
        } else if (v0 === vMax && v1 !== vMax){
                tp = t*((vAverageValue-vt)/(vp-vt))
                tt = t-tp;
                tr = 0;
                at = (vMax-v1)/tt;
                ar = 0;
        } else if(v1 === vMax && v0 !== vMax){
                tr = t*((vAverageValue-vp)/(vr-vp))
                tp = t - tr;
                tt = 0;
                at = 0;
                ar = (vMax-v0)/tr;
        } else if (v0 === v1 && v1 === vMax && v0,v1,vMax>0) {
                tp=l/t;
                tr = 0;
                tt = 0;
                at = 0;
                ar = 0;
        } else {
                tr = 0;
                tt = 0;
                tp = 0;
                at = 0;
                ar = 0;
        }
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
    
        processedData.push({'tr': tr, 'tt': tt, 'tp': tp, 'ar': ar, 'at': at, 'us': us, 'usPas': usPas, 'consum': consum});

        
    }
    
    firstData.forEach((dataBlock) => {
        calculation(dataBlock);
    });

    workbook.xlsx.readFile(`./files/${file}`)
    .then(() => {
        const title = workbook.getWorksheet(1).getRow(7);
        title.getCell(28).value = 'tr';
        title.getCell(29).value = 'tt';
        title.getCell(30).value = 'tp';
        title.getCell(31).value = 'ar';
        title.getCell(32).value = 'at';
        title.getCell(33).value = 'us';
        title.getCell(34).value = 'usPas';
        title.getCell(35).value = 'consum';
        for (let i = 0; i < processedData.length; i++) {
            var worksheet = workbook.getWorksheet(1);
            var row = worksheet.getRow(i+8);
            row.getCell(28).value = processedData[i].tr;
            row.getCell(29).value = processedData[i].tt;
            row.getCell(30).value = processedData[i].tp;
            row.getCell(31).value = processedData[i].ar;
            row.getCell(32).value = processedData[i].at;
            row.getCell(33).value = processedData[i].us;
            row.getCell(34).value = processedData[i].usPas;
            row.getCell(35).value = processedData[i].consum;
            if (!isNaN(processedData[i].us)) {
                usSum += processedData[i].us;
            } else {
                usSum += 0;
            }
            if (!isNaN(processedData[i].usPas)) {
                usPasSum += processedData[i].usPas;
            } else {
                usPasSum += 0;
            }
            if (!isNaN(processedData[i].consum)) {
                consumSum += processedData[i].consum;
            } else {
                consumSum += 0;
            } 
            totalUs += usSum;
            totalUsPas += usPasSum;
            totalConsum += consumSum;
        }
        let lastRow = worksheet.getRow(processedData.length + 8);
        lastRow.getCell(33).value = usSum;
        lastRow.getCell(34).value = usPasSum;
        lastRow.getCell(35).value = consumSum;
        usSum = 0;
        usPasSum = 0;
        consumSum = 0;
        console.log('TotalUs: ' + totalUs);
        console.log('TotalUsPas: ' + totalUsPas);
        console.log('TotalConsum: ' + totalConsum);
        row.commit();
        return workbook.xlsx.writeFile(`processedData/${file}`);
    })
})



