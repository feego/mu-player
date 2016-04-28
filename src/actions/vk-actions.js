import * as vk from 'vk-universal-api';
import errorHandler from '../helpers/error-handler';
import Promise from 'bluebird';
import storage, { PROFILE_CHANGED } from '../storage/storage';

const SEARCH_LIMIT = 100;
const NOTFOUND = 'VK:NotFound';

let handleData = (result) => {
  if (!Array.isArray(result) || result.length === 0) throw new Error(NOTFOUND);

  return result.filter(obj => obj.artist && obj.title).map(obj => {
    obj.source = 'vk';
    obj.artist = obj.artist.replace(/&amp;/g, '&').trim();
    obj.title = obj.title.replace(/&amp;/g, '&').trim();

    return obj;
  });
};

export let getSearch = (query, opts={}) => {
  Logger.screen.info('vk.com', `audio.search("${query}")`);

  let limit = opts.limit || SEARCH_LIMIT;
  let offset = opts.offset || 0;
  let tryTimeout = opts.tryTimeout || storage.data.search.timeout;
  let tryAttempts = opts.tryAttempts || storage.data.search.retries;
  let tryCounter = 0;

  let queryOpts = {
    count: limit,
    offset: offset * limit,
    q: query,
    sort: 2,
    search_own: opts.searchOwn || 0
  };

  return new Promise((resolve, reject) => {
    let localError = (err) => {
      if (tryCounter++ >= tryAttempts || err.message === NOTFOUND) return reject(err);

      Logger.screen.info('vk.com', `retrying audio.search(${query}) ...${tryCounter} of ${tryAttempts}`);
      doSearch();
    };

    let done = (result) => {
      if (!result || !result.items) return localError(new Error('Unknown answer: ' + result));

      resolve(Promise.resolve(handleData(result.items)));
    };

    let doSearch = () => {
      vk.method('audio.search', queryOpts)
        .timeout(tryTimeout)
           .then((res) => done(res))
              .catch((err) => localError(err));
    };

    doSearch();
  });

  // let request = vk.method('audio.search', queryOpts);
  // return request.then(response => handleData(response.items));
};

export let getOldSearch = (query, opts={}) => {
  Logger.screen.info('vk.com', `audio.search("${query}")`);

  let limit = opts.limit || SEARCH_LIMIT;
  let offset = opts.offset || 0;

  let queryOpts = {
    count: limit,
    offset: offset * limit,
    q: query,
    sort: 2
  };

  let request = vk.method('audio.search', queryOpts);
  return request.then(response => handleData(response.items));
};


export let getSearchWithArtist = (track, artist, opts) => {
  let query = artist + ' ' + track;
  return getSearch(query, opts);
};

export let getSearchWithArtistExact = (track, artist) => {
  // TODO: need to fetch ALL results using pagination
  Logger.screen.info('vk.com', `audio.search("${track}", "${artist}")`);
  let request = vk.method('audio.search', {
    count: SEARCH_LIMIT,
    offset: 0,
    performer_only: 1,
    q: artist
  });
  return request.then(response => {
    let items = [];
    response.items.forEach((item) => {
      if (item.title.toLowerCase().indexOf(track.toLowerCase()) !== -1) items.push(item);
    });

    // if (items.length === 0) {
    //   Logger.screen.error(`vk.com`, `not found "${artist}"-"${track}"`);
    //   throw new Error('NotFound');
    // }

    // Logger.screen.info('vk.com', 'found:', items.length, 'track(s)');

    return handleData(items);
  });
};



export let get = (opts={}) => {
  Logger.screen.info('vk.com', `audio.get()`);

  let tryTimeout = opts.tryTimeout || storage.data.search.timeout;
  let tryAttempts = opts.tryAttempts || storage.data.search.retries;
  let tryCounter = 0;

  return new Promise((resolve, reject) => {
    let localError = (err) => {
      if (tryCounter++ >= tryAttempts || err.message === NOTFOUND) return reject(err);

      Logger.screen.info('vk.com', `retrying audio.get() ...${tryCounter} of ${tryAttempts}`);
      doGet();
    };

    let done = (result) => {
      if (!result || !result.items) return localError(new Error('Unknown answer: ' + result));

      resolve(Promise.resolve(result.items.concat(result.meta)));
    };

    let doGet = () => {
      vk.method('audio.get', opts)
        .timeout(tryTimeout)
           .then((res) => done(res))
              .catch((err) => localError(err));
    };

    doGet();
  });
};

export let getAlbums = (opts = {}) => {
  Logger.screen.info('vk.com', `audio.getAlbums()`);

  let tryTimeout = opts.tryTimeout || storage.data.search.timeout;
  let tryAttempts = opts.tryAttempts || storage.data.search.retries;
  let tryCounter = 0;

  return new Promise((resolve, reject) => {
    let localError = (err) => {
      if (tryCounter++ >= tryAttempts || err.message === NOTFOUND) return reject(err);

      Logger.screen.info('vk.com', `retrying audio.getAlbums() ...${tryCounter} of ${tryAttempts}`);
      getAlbums();
    };

    let done = (result) => {
      if (!result || !result.items) return localError(new Error('Unknown answer: ' + result));

      resolve(Promise.resolve(result.items));
    };

    let getAlbums = () => {
      vk.method('audio.getAlbums', {})
        .timeout(tryTimeout)
        .then((res) => done(res))
        .catch((err) => localError(err));
    };

    getAlbums();
  });
};

export let addToProfile = (selected, album_id) => {
  return vk.method('audio.add', { audio_id: selected.aid , owner_id: selected.owner_id, album_id }).then((track) => {
    Logger.screen.info('Track added to profile successfully.');
    storage.emit(PROFILE_CHANGED);
    return selected;
  });
};

export let deleteFromProfile = (selected) => {
  return vk.method('users.get')
    .then(user => vk.method('audio.delete', { owner_id: user.meta.uid, audio_id: selected.aid }))
    .then(() => {
      Logger.screen.info('Track deleted from profile successfully.');
      storage.emit(PROFILE_CHANGED);
      return selected.aid;
    }).catch(error => console.log(error))
};
