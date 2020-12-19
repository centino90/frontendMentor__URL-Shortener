/* 
=================
=========REMINDER
=================
 
 This app module is responsible for three (3) parts:
    - API calling (for the data used in this app)
    - Markup building (for the link markup)
    - Local Storage Handling (to retain link markup even on reload)

 Others:   
 Every non-builtin function/method used in different parts of the app has info about its functionality appended before it.

 localStorage.clear() // remove all data in storage (useful for testing)
*/


/* VARIABLES */
const menu = document.querySelector('.lnr-menu');
//deconstruct [form input, form button]
const [text, submit] = document.querySelectorAll('.main__form-input');
const error = document.querySelector('.error');
const link_record = document.querySelector('.main__link-record');


/* EVENT LISTENERS */
//when content is loaded build markup based on saved data from localstorage
document.addEventListener('DOMContentLoaded', reinsertText);

//toggle menu off and on
menu.addEventListener('click', () => {
    document.querySelector('html').classList.toggle('menu-toggled');
})

//select all btn with class 'copy'
selectCopyBtn();

submit.addEventListener('click', e => {
    e.preventDefault();
    // in case user clicks multiple times instead of 1 per loading, it will not proceed to the proceeding line
    if (submit.classList.contains('loading')) return

    if (text.value == '' || !text || text === undefined) {
        console.error('empty input');
        error.textContent = 'REMINDER!: Please add a link';
        text.classList.add('text-error');
        return
    }
    error.textContent = '';
    //show loader
    submit.classList.add('loading');

    //start request
    fetch(`https://api.shrtco.de/v2/shorten?url=${text.value}`)
        .then((res) => {
            return res.json()
        })
        .then(data => {
            return data.ok ? data : data = null
        })
        .then(displayResult)
})


/* FUNCTIONS/METHODS */
function displayResult(data) {
    //remove loader
    submit.classList.remove('loading');

    if (!data || data.result === undefined) {
        console.error('invalid url');
        error.textContent = 'ERROR!: Invalid URL';
        text.classList.add('text-error');
        text.value = '';
        return
    }

    let link = {
        code: data.result.code,
        original: data.result.original_link,
        short: data.result.short_link
    }
    // display markup with values already inserted
    insertText(link.original, link.short);
}

function insertText(orig, short) {
    //setup link markup when api request is success
    createLinks(orig, short);
    //save data in storage
    saveInLocalStorage(orig, short);
    //select all btn with class 'copy'
    selectCopyBtn();
    text.value = '';
}

function reinsertText() {
    //set storage
    let records = setupStorage();
    // loop through storage to filter 2 different data [original link, new link]
    for (let i = 0; i < (records.length) / 2; i++) {
        if(i == 0) createLinks(records[i], records[i+1]);
        else if (i == 1) createLinks(records[i+1], records[i+2]);
        else if (i % 2 == 0 && i >= 2) createLinks(records[i+i], records[i+i+1]);
        else if (i % 2 == 1 && i >= 2) createLinks(records[i+i], records[i+i+1]);
    }
    //select all btn with class 'copy'
    selectCopyBtn();
}

function selectCopyBtn() {
    const copyBtn = document.querySelectorAll('.copy');
    copyBtn.forEach((cur) => {
        cur.addEventListener('click', clipText);
    })
}

function clipText() {
    this.classList.add('copied');
    const clip = this.previousSibling;
    clip.select();
    clip.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert('copied to clipboard!')
}

function setupStorage() {
    let records;
    if (localStorage.getItem('links') === null) {
        return records = []
    } else {
        return records = JSON.parse(localStorage.getItem('links'))
    }
}

function saveInLocalStorage(orig, short) {
    // if storage is empty setup one otherwise return the parsed data from storage
    let records = setupStorage();

    records.push(orig, short);
    localStorage.setItem('links', JSON.stringify(records))
}

function createLinks(first, second) {
    let short_link = document.createElement('div');
    let left_div = document.createElement('div');
    let right_div = document.createElement('div');
    let orig_link = document.createElement('p');
    let new_link = document.createElement('input');
    let btn = document.createElement('button');

    orig_link.textContent = first;
    new_link.value = second;

    new_link.setAttribute('type', 'text');
    new_link.setAttribute('readonly', '');
    btn.textContent = 'Copy';
    new_link.classList.add('main__new-link');
    btn.classList.add('copy');
    left_div.classList.add('main__left-link');
    right_div.classList.add('main__right-link');
    short_link.classList.add('main__short-link');

    right_div.appendChild(new_link);
    right_div.appendChild(btn);
    left_div.appendChild(orig_link);
    short_link.appendChild(left_div);
    short_link.appendChild(right_div);
    link_record.appendChild(short_link)
}

/* 
=================
=========END OF FILE
=================
*/