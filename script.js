class Momento {
    constructor(cryptoIn, interval, percent, convs) {
        this.now = new Date();
        this.saldo = cryptoIn;
        this.interest = 0;
        this.interval = interval; // in hours
        this.percent = percent / 100;
        this.history = [];
        this.convs = convs;
    }

    addMoney = () => {
        this.interest = this.saldo * this.percent
        this.saldo += this.interest;
        this.now.setHours(this.now.getHours() + this.interval);
        this.history.push(this.getMoment());
    }

    getMoment = () => {
        const {now, saldo, percent, interest, conv} = this;
        return {
            now: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${hhmm(now)}`,
            saldo,
            interest,
            eurConvs: this.convs.map((v) => v * saldo),
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
    convs: [],
};
const d = window.data;
const now = new Date();
let rows = '';
const getUrl = (mon1 = '', mon2 = 'eur') =>
    `https://api.coingecko.com/api/v3/simple/price?ids=${mon1}&vs_currencies=${mon2}`;

const update = () => {
    rows = '';
    const {cryptoIn, cryptoOut, interval, percentuale, convs} = d;
    const moment = new Momento(cryptoIn, interval, percentuale, convs);
    moment.touchCryptoOut(cryptoOut);
    moment.getHistory().forEach(addRow)
    root.innerHTML = rows;
}

function updateWithConv(mons, i = 0) {
    if (axios === undefined) return errorCoinGecko();

    axios.get(getUrl(mons[i]))
        .then((resp) => {
            window.data.convs.push(resp.data[mons[i]].eur);
            if (mons[i + 1]) updateWithConv(mons, i + 1);
            update();
        })
        .catch((err) => {
            console.log(err);
            errorCoinGecko();
        });
}

function errorCoinGecko() {
    alert('Non riesco a comunicare con CoinGecko.\n' +
                'E possibile che le conversioni in euro siano assenti.');
}

function addRow(m) {
    let {saldo, interest, eurConvs} = m;
    const appr = 1000000;
    saldo = Math.floor(saldo * appr) / appr;
    interest = Math.floor(interest * appr) / appr;
    const e = eurConvs.map((eur) =>  Math.floor(eur * 100) / 100);
    
    const dsp = (e) => e === undefined ? '?' : e;
    // giorno saldo interessi
    rows += `<tr><td>${m.now}</td><td>${saldo}</td><td>${interest}</td><td>${dsp(e[0])}</td><td>${dsp(e[1])}</td></tr>`
}

function onChange(id, value) {
    const nVal = Number(value);
    if (!(Number.isNaN(nVal)) && nVal > 0) {
        window.data[id] = nVal;
        update();
        updateWithConv(['wonderland', 'klima-dao']);
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
updateWithConv(['wonderland', 'klima-dao']);
