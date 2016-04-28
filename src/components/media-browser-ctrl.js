import _ from 'lodash';
import storage from './../storage/storage';
import loadingSpinner from '../tui/loading-spinner';
import similarPrompt from './../tui/similar-prompt';
import listPrompt from './../tui/list-prompt';
import * as vkActions from './../actions/vk-actions';
import * as playlist from './playlist-ctrl';
import errorHandler from '../helpers/error-handler';

let screen = null;
let menuPane = null;
let treeData = {};
let playlists = null;

export let init = (_screen, _menuPane) => {
  screen = _screen;
  menuPane = _menuPane;

  menuPane.on('select', (item) => {
    if (item.fn) item.fn();
  });
};

function TrackItem(track, playlistId) {
  this.name = '{bold}[' + track.artist + ']{/bold} ' + track.title;
  this.playlistId = playlistId;
  this.id = track.aid;
}

TrackItem.prototype.fn = function() {
  playlist.setPlaylist(playlists[this.playlistId]);
};

export let search = (payload = {}) => {
  let albums = [];
  let spinner = loadingSpinner(screen, 'Searching for tracks...', false, payload.query);
  let tryTimeout = storage.data.search.timeout;
  let tryAttempts = storage.data.search.retries;
  spinner.stop();

  let menu = { extended: true, children: {} };
  vkActions.getAlbums()
    .then(results => {
      const fetchAlbumsPromises = results.map(album => {
        albums.push(album);
        return vkActions.get({ album_id: album.album_id }); 
      });
      return Promise.all(fetchAlbumsPromises);
    })
    .then(results => {
      let rootKey;
      let menu = { extended: true, children: {} };

      for (let index = 0, size = albums.length; index < size; index++) {
        const album = albums[index];
        rootKey = album.title;
        menu.children[rootKey] = {
          id: album.album_id,
          name: '{bold}{light-white-fg}' + rootKey + '{/light-white-fg}{/bold}',
          extended: true,
          children: {}
        };

        menu.children[rootKey].children = results[index].map(track => new TrackItem(track, index));
      }

      playlists = results;
      treeData = menu;
      spinner.stop();
      renderPane();
    });
};

export let renderPane = () => {
  menuPane.setData(treeData);
  screen.render();
};
