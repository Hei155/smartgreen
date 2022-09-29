const { NODE_ENV } = process.env;
const mongoose = require('mongoose');
const reader = require('xlsx');
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

let data = []

const sheets = file.SheetNames

for(let i = 0; i < sheets.length; i++) {
    count = 3;
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
        if (typeof temp[j].__EMPTY_6 == 'number' && a && j > 4) {
            let date0 = a.v.split(' ')[1].split(':')
            let date1 = b.v.split(' ')[1].split(':')
            data.push({'t0': date0, 't1': date1, 't': deltaTime(date1, date0), 'l': temp[j].__EMPTY_14, 'v0': temp[j].__EMPTY_4, 'v1': v1, 'vMax': temp[j].__EMPTY_13})
        }
        count++;
    }
}


function calculation({t, l, v0, v1, vMax}) {
    let vr = (vMax + v0)/(2*3.6);
    let vp = vMax/3.6;
    let vt = (vMax+v1)/(2*3.6);
    let vAverageValue = l/t;
    let tr;
    let tp;
    let tt;
    let ar;
    let at;
    if (v0 != vMax && v1 != vMax && v0,v1,vMax>0){
        if (vAverageValue > v0 && vAverageValue > v1) {
            const delta = (vMax-v0)*(vr-vp)/3.6 - (vMax-v1)*(vt-vp)/3.6;
            const deltaAr = (l-vp*t) - ((vMax-v1)*(vt-vp)/3.6)*(4*(2*vAverageValue-v0-v1))/t;
            const deltaAt = ((vMax-v0)*(vr-vp)/3.6)*(4*(2*vAverageValue-v0-v1))/t - (l-vp*t);
            ar = deltaAr/delta;
            at = deltaAt/delta;
            tr = 1/((vMax-v0)/ar);
            tt = 1/((vMax-v1)/at);
            tp = 1/(t - tr - tt);
            console.log(tr, tt, tp)
        } else if (vAverageValue > v0 && vAverageValue <= v1) {

        }
    } else if (v0 == vMax && v1 != vMax && tr == 0){
            tp = t*((vAverageValue-vt)/(vr-vt))
            tt = t-tp
            at = (vMax-v1)/tt
    } else if(v1==vMax && v0 != vMax && tt == 0){
            tr = t*((vAverageValue-vp)/(vr-vp))
            tp = t - tp
            ap = (vMax-v0)/tr
    } else if (v0===v1 && v1===vMax && v0,v1,vMax>0) {
            tp=l/t
            tr=0
            tt=0
    } else {
            tr=tp=tt=0
    }
}

data.forEach((dataBlock) => {
    calculation(dataBlock)
})