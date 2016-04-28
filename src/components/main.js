import storage, { PAUSE, SHOW_HELP, ADD_TO_PROFILE, DELETE_FROM_PROFILE, PROFILE_CHANGED } from './../storage/storage';

import HelpBox from './../tui/help-box';
import SelectList from './../tui/select-list';
import * as vkActions from './../actions/vk-actions';
import * as leftPane from './media-browser-ctrl';
import * as rightPane from './playlist-ctrl';
import * as player from './../player/player-control';
import * as qsearch from './qsearch';

export default (screen, layout) => {
  layout.logger.error = (msg, ...args) => {
    args.splice(0, 0, '{red-fg}' + msg + '{/red-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  layout.logger.info = (msg, ...args) => {
    args.splice(0, 0, '{cyan-fg}' + msg + '{/cyan-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  layout.logger.status = (msg, ...args) => {
    args.splice(0, 0, '{green-fg}' + msg + '{/green-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  // logger should be first
  Logger.screen = layout.logger;
  leftPane.init(screen, layout.mediaTree);
  rightPane.init(screen, layout);
  qsearch.init(screen, layout);

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  storage.on(PROFILE_CHANGED, () => leftPane.search());
  storage.on(ADD_TO_PROFILE, () => {
    const profilePlaylists = layout.mediaTree.data.children;
    const profilePlaylistsNames = Object.keys(profilePlaylists);
    SelectList(screen, profilePlaylistsNames).then(option => {
      rightPane.addToProfile(layout.playlist.selected, profilePlaylists[profilePlaylistsNames[option]].id);
    });
  });
  storage.on(DELETE_FROM_PROFILE, () => {
    const aid = layout.mediaTree.nodeLines[layout.mediaTree.rows.selected].id;
    if (aid) {
      vkActions.deleteFromProfile({ aid });
    }
  });
};
