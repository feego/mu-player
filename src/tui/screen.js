import blessed from 'blessed';

export default () => {
  let screen = blessed.screen({
    smartCSR: true,
    // fastCSR: true,
    dockBorders: true,
    ignoreDockContrast: true,
    autoPadding: true,
    cursor: {
      artificial: true,
      shape: 'underline',
      blink: true,
      color: null // null for default
    }
  });

  return screen;
};
