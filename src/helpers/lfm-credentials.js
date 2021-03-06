import * as vk from 'vk-universal-api';
import inquirer from 'inquirer-question';

import storage from './../storage/storage';

let authUrl = 'http://www.last.fm/api/account/create';

let lfmApiKeyExample = '27be0fs25db87c9a32b8d53620634a1e';
let lfmSecretExample = '4g4e024c45b87c9a3g2b2h7d20634a1e';

let lfmApiKey = {
  name: 'lfmApiKey',
  type: 'input',
  message: `Open "${authUrl}" in browser. Register your app.
            \nCopy and paste lastfm api key here. It should look like "${lfmApiKeyExample}"
            \nlfmApiKey> `
};

let lfmSecret = {
  name: 'lfmSecret',
  type: 'input',
  message: `Copy and paste lastfm secret key here. It should look like "${lfmSecretExample}"
            \nlfmSecret> `
};

export let hasData = () => (typeof storage.data.lfmApiKey !== 'undefined' && typeof storage.data.lfmSecret !== 'undefined');
export let init = () => hasData() ? Promise.resolve(true) : Promise.resolve(false);
export let getInfo = () => {
  return storage.data.lfmSecret + ' ' + storage.data.lfmApiKey;
};

storage.vkHasData = hasData;

export let dialog = () => {
  return inquirer.prompt([lfmApiKey, lfmSecret]).then((credentials) => {
    storage.data.lfmApiKey = credentials.lfmApiKey;
    storage.data.lfmSecret = credentials.lfmSecret;
    storage.save();
    //init();
    return Promise.resolve(true);
  }).catch((err) => {
    console.log('wrong data');
  });
};
