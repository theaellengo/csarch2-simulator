let num = '123456781234567801';
let str;

let ceiling = num;
console.log(ceiling);

let ceilingstr = ceiling.toString().replace('.', '');
console.log(ceilingstr);

var rem = parseInt(num) - parseInt(ceilingstr.slice(0, 16)) == 0 ? false : true;

let ceilingarr = ceilingstr.slice(0, 17).split('');
console.log(ceilingarr);

if (rem) {
  ceilingarr[15] = parseInt(ceilingarr[15]) + 1;
}
str = ceilingarr.join('').slice(0, 16);

console.log(str);
