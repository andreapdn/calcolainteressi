class Momento {
    constructor(cryptoIn, interval, percent, conv) {
        this.now = new Date();
        this.saldo = cryptoIn;
        this.interest = 0;
        this.interval = interval; // in hours
        this.percent = percent / 100;
        this.history = [];
        this.conv = conv;

        this.history.push(this.getMoment());
    }

    addMoney = () => {
        this.interest = this.saldo * this.percent;
        this.saldo += this.interest;
        this.now.setHours(this.now.getHours() + this.interval);
        this.history.push(this.getMoment());
    }

    getMoment = () => {
        const {now, saldo, interest, conv} = this;
        return {
            now: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${hhmm(now)}`,
            saldo,
            interest,
            conv: conv * saldo,
        }
    }

    getHistory = () => this.history;

    touchCryptoOut = (cryptoOut) => {
        while(this.saldo < cryptoOut) {
            this.addMoney();
        }
    }
}

// Displaying error if axios is not defined
if (typeof axios == 'undefined') {
    errorCoinGecko();
} else {
    document.getElementById('currency').value = 'Bitcoin';
}

const baseUrl = 'https://api.coingecko.com/api/v3';
const getEl = document.getElementById.bind(document);
const root = getEl('root');
window.data = {
    cryptoIn: 1,
    interval: 1,
    percentuale: 10,
    cryptoOut: 20,
    conv: 0,
    options: [],
};
const d = window.data;
const now = new Date();
let rows = '';
const getUrl = (mon1 = '', mon2 = 'eur') =>
    `${baseUrl}/simple/price?ids=${mon1}&vs_currencies=${mon2}`;

const update = () => {
    rows = '';
    const {cryptoIn, cryptoOut, interval, percentuale, conv} = d;
    const moment = new Momento(cryptoIn, interval, percentuale, conv);
    moment.touchCryptoOut(cryptoOut);
    moment.getHistory().forEach(addRow)
    root.innerHTML = rows;
}

function updateWithConv(mon1, mon2 = 'eur') {
    if (typeof axios == 'undefined') return;

    if (mon1 === undefined) {
        const currency = document.getElementById('currency');
        const name = currency.value;
        const i = d.options.findIndex((v) => v.name == name);
        if (i == -1) {
            d.conv = 0;
            update();
            return;
        } else {
            mon1 = d.options[i].id;
        }
    }

    axios.get(getUrl(mon1, mon2))
        .then((resp) => {
            console.log(mon1);
            console.log(resp.data[mon1]);
            d.conv = resp.data[mon1][mon2];
            update();
        })
        .catch((err) => {
            console.log(err);
            errorCoinGecko();
        });
}

function errorCoinGecko() {
    alert('Impossibile raggiungere il server col tasso di cambio. ' +
        'E\' comunque possibile utilizzare l\'applicazione senza ' +
        'usufruire delle conversioni in euro.');
}

function getCurrencies() {
    if (typeof axios == 'undefined') return;
    const currDatalist = document.getElementById('currencies');
    axios.get(`${baseUrl}/coins/list`)
        .then((resp) => {
            const dt = resp.data;
            d.options = dt;
            const getOpt = (val) => `<option value="${val}">`;
            let options = '';
            dt.forEach((v) => options += getOpt(v.name))
            currDatalist.innerHTML = options;
        })
        .catch((err) => console.error(err));
}

function addRow(m) {
    let {saldo, interest, conv} = m;
    const appr = 1000000;
    saldo = Math.floor(saldo * appr) / appr;
    interest = Math.floor(interest * appr) / appr;
    conv = Math.floor(conv * 100) / 100;
    
    const dsp = (e) => e === undefined ? '?' : e;
    // giorno saldo interessi
    rows += `<tr><td>${m.now}</td><td>${saldo}</td><td>${interest}</td><td>${conv}€</td></tr>`
}

function onChange(id, value) {
    const nVal = Number(value);
    if (!(Number.isNaN(nVal)) && nVal > 0) {
        window.data[id] = nVal;
        update();
        updateWithConv();
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

getCurrencies();
update();
updateWithConv('bitcoin');
