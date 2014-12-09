// Get a printable character for a given key.

function charFromKeycode(k){
  switch(k){
    case 8: return '⌫'; // backspace
    case 9: return '⇥'; //tab
    case 13: return '↩'; //enter
    case 16: return '⇧'; //shift
    case 17: return '⌃'; //ctrl
    case 18: return '⌥'; //alt
    case 19: return 'pb'; //pause/break
    case 20: return '⇪'; //caps-lock
    case 27: return '⎋'; //esc
    case 33: return '⇞'; //page-up
    case 34: return '⇟'; //page-dn
    case 35: return '↘'; //end
    case 36: return '↖'; //home
    case 37: return '←'; //left-arr
    case 38: return '↑'; //up-arr
    case 39: return '→'; //right-arr
    case 40: return '↓'; //down-arr
    case 45: return 'ins';//insert
    case 46: return '⌦'; //delete
    case 188: return ',';
    case 190: return '.';
    case 32: return ' ';
    case 192: return '$';
    case 191: return '/';
    case 186: return ';';
    case 222: return "'";
    case 220: return '\\';
    case 221: return '@';
    case 91:
    case 92:
      return '⌘'; // super, command, or windows
    default:
      if (48<=k && k<=57) {
        // top row numbers
        return ''+(k-48);
      } else if (96<=k && k<= 105) {
        // numpad numbers
        return ''+(k-96);
      } else if (65<=k && k<=90) {
        // alphabet; we get to cheat here
        return String.fromCharCode(k).toLowerCase();
      } else if (112<=k && k<=123) {
        // function keys F1 - F12
        return 'F'+(k-111);
      }
      return k;
  }
}
