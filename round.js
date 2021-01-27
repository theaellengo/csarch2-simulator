var num = 11112222333344446666;
var exp = 0;

while (num >= Math.pow(10, 16)) {
  num /= 10;
  exp++;
}
while (num % 1 != 0) {
  num *= 10;
  if (num / Math.pow(10, 16) < 1) exp--;
}

var rtnte = Number(num.toPrecision(16));
var rtntestr = rtnte.toString().replace('.', '').slice(0, 16);
console.log(parseInt(rtntestr));

// If sign is positive, floor is truncate, ceiling is ceiling
// If sign is negative, ceiling is truncate, floor is ceiling
var trunc = num.toString().slice(0, 16);
console.log(parseInt(trunc));

var ceiling = Number(num.toPrecision(17));
var ceilingstr = ceiling.toString().replace('.', '');
var ceilingarr = ceilingstr.slice(0, 17).split('');
if (!ceilingarr[16] == '0') {
  ceilingarr[15] = parseInt(ceilingarr[15]) + 1;
}
console.log(ceilingarr.join('').slice(0, 16));
