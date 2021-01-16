var nums = new Array(64)
var combifield = new Array(5)
var eprime = 398

// User Input
var dec = [7, 1, 2, 3, 6, 4, 5, 1, 2, 3, 6, 7, 5, 4, 3, 1]
var exp = 15
var sign = 0

var i
for (i = 0; i < nums.length; i++) {
  nums[i] = dec[i] ? dec[i] : 0
}

eprimebin = decToBin(eprime + exp, 10)

if (dec[0] < 8) {
  combifield = decToBin(dec[0], 5)
  combifield[0] = eprimebin[0]
  combifield[1] = eprimebin[1]
} else {
  combifield = [1, 1, 0, 0]
  combifield[4] = dec[0] == 8 ? 0 : 1
}

econt = eprimebin.slice(2, 10)

console.log(sign)
console.log(combifield)
console.log(econt)

function decToBin(num, len) {
  var a = new Array(len)
  var rem = num
  for (i = a.length - 1; i >= 0; i--) {
    a[i] = rem % 2
    rem = ~~(rem / 2)
  }
  return a
}
