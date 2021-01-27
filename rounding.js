num = '1234567812345678001';

let ceiling = num.toString();
let offset = new Array(ceiling.length - 16).fill('0').join('');

let ceilingstr = ceiling.toString().replace('.', '');
ceilingstr = ceilingstr.slice(0, 16).concat(offset);

var rem =
  parseFloat(ceiling.slice(15, num.length)) -
    parseFloat(ceilingstr.slice(15, num.length)) ==
  0
    ? false
    : true;

let ceilingarr = ceilingstr.slice(0, 16).split('');
if (rem) {
  ceilingarr[15] = parseInt(ceilingarr[15]) + 1;
}
console.log(ceilingarr.join('').slice(0, 16));
