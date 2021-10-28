class Momento {
    constructor(cryptoIn, interval, percent) {
        this.now = new Date();
        this.saldo = cryptoIn;
        this.interval = interval; // in hours
        this.percent = percent / 100;
        this.history = [];
    }

    addMoney = () => {
        this.saldo += this.saldo * this.percent;
        this.now.setHours(this.now.getHours() + this.interval);
        this.history.push(this.getMoment());
    }

    getMoment = () => {
        const {now, saldo, percent} = this;
        return {
            now: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${hhmm(now)}`,
            saldo,
            interesse: saldo * percent,
        }
    }

    getHistory = () => this.history;

    touchCryptoOut = (cryptoOut) => {
        while(this.saldo < cryptoOut) {
            this.addMoney();
        }
    }
}

const getEl = document.getElementById.bind(document);
const root = getEl('root');
window.data = {
    cryptoIn: 10,
    interval: 1,
    percentuale: 10,
    cryptoOut: 20,
};
const d = window.data;
const now = new Date();
let rows = '';

const update = () => {
    rows = '';
    const {cryptoIn, cryptoOut, interval, percentuale} = d;
    const moment = new Momento(cryptoIn, interval, percentuale);
    moment.touchCryptoOut(cryptoOut);
    moment.getHistory().forEach(addRow);
    root.innerHTML = rows;
}

function addRow(m) {
    let {saldo, interesse} = m;
    const appr = 10000;
    saldo = Math.floor(saldo * appr) / appr;
    interesse = Math.floor(interesse * appr) / appr;
    
    // giorno saldo interessi
    rows += `<tr><td>${m.now}</td><td>${saldo}</td><td>${interesse}</td></tr>`
}

function onChange(id, value) {
    const nVal = Number(value);
    if (!(Number.isNaN(nVal)) && nVal > 0) {
        window.data[id] = nVal;
        update();
    }
}

function hhmm(date) {
    let hh = date.getHours();
    let mm = date.getMinutes();
    mm = (mm > 9 ? '' : '0') + mm;
    hh = (hh > 9 ? '' : '0') + hh;
    return `${hh}:${mm}`;
}

const inputs = document.getElementsByClassName('inputField');
Array.from(inputs).forEach((v) => v.value = '');

update();