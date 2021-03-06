import blessed from 'blessed';
import listStyle from './list-style';
import headerStyle from './header-style';

export default (parent) => {
  let box = blessed.list({
    ...listStyle,
    top: 1,
    left: '0',
    width: '30%',
    bottom: 2,
    items: ['Loading']
  });

  // let qsearch = blessed.textbox({
  //   //parent: parent,
  //   top: 1,
  //   left: 0,
  //   height: 2,
  //   width: '30%',
  //   align: 'right',
  //   label: 'qsearch:',
  //   content: 'qsearch:',
  //   inputOnFocus: true
  // });


  let h = blessed.text({
    ...headerStyle,
    //parent: parent,
    top: 0,
    left: 0,
    height: 1,
    width: '30%',
    align: 'center',
    content: 'Media Browser'
  });

  let hHover = blessed.text({
    top: 0,
    left: 0,
    height: 1,
    width: '30%',
    align: 'center',
    content: 'Media Browser',
    style: {
      fg: '#fffffe',
      bg: '#d65d0e',
    }
  });


  parent.append(box);
  parent.append(h);
  parent.append(hHover);

  return {
    box,
    h,
    hHover,
  };
};
