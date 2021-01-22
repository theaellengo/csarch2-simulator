module.exports = {
  getmain: function (req, res) {
    res.render('index');
  },
  getinput: function (req, res) {
    //User Input
    var finput = parseFloat(req.body.inputFloat);
    var exp = parseInt(req.body.inputExp);
    var exists = true;
    console.log(finput);
    console.log(exp);

    var sign = finput >= 0 ? 0 : 1;
    while (finput % 1 != 0) {
      if (finput > 0) {
        finput *= 10;
        exp -= 1;
      } else {
        finput /= 10;
        exp += 1;
      }
    }

    var temp = finput.toString().split('');
    var dec = new Array(16).fill(0);
    var i;
    for (i = 0; i < temp.length; i++) {
      dec[16 - temp.length + i] = parseInt(temp[i]);
    }
    console.log('Decimal: ' + dec);
    console.log('Exponent: ' + exp);

    var step1 = new Step({
      num: 1,
      process: 'Normalize to 16 Decimal Digits',
      result: dec.join('') + ' x10 ^' + exp
    });

    var eprime = decToBin(398 + exp, 10);
    var cf = getcf(dec[0], eprime);
    var econt = eprime.slice(2, 10);

    var step2 = new Step({
      num: 2,
      process: "Get e'",
      result: exp.toString() + ' + 398 = ' + (exp + 398)
    });

    var step3 = new Step({
      num: 2,
      process: "Get Combination Field'",
      result: cf.join('')
    });

    var nums = [sign, ...cf, ...econt];
    console.log('Sign, CF, Econt: ' + nums);

    for (i = 0; i < nums.length; i += 4) {
      //console.log(binToHex(nums.slice(i, i + 4)));
    }

    const steps = { step1, step2, step3 };

    res.render('index', {
      finput: parseFloat(req.body.inputFloat),
      exists: exists,
      expinput: parseFloat(req.body.inputExp),
      binary: dec.join(''), // temp (not result)
      hex: binToHex(dec), // temp (not result)
      steps: steps
    });
  }
};

//Constuctor for Step
function Step({ num, process, result }) {
  this.num = num;
  this.process = process;
  this.result = result;
}

function decToBin(num, len) {
  var a = new Array(len);
  var rem = num;
  for (i = a.length - 1; i >= 0; i--) {
    a[i] = rem % 2;
    rem = ~~(rem / 2);
  }
  return a;
}

function getcf(msb, eprime) {
  var a = new Array(5);
  if (msb < 8) {
    a = decToBin(msb, 5);
    a[0] = eprime[0];
    a[1] = eprime[1];
  } else {
    a = [1, 1, 0, 0];
    a[4] = msb == 8 ? 0 : 1;
  }
  return a;
}

function binToHex(bins) {
  let map = new Map([
    [10, 'A'],
    [11, 'B'],
    [12, 'C'],
    [13, 'D'],
    [14, 'E'],
    [15, 'F']
  ]);

  var i;
  var sum = 0;
  for (i = 0; i < 4; i++) {
    bins[i] *= Math.pow(2, 3 - i);
    sum += bins[i];
  }

  return sum < 10 ? sum : map.get(sum);
}

/**TODO**/
function denselyPacked(nums) {
  var bin = nums.map(x => decToBin(x, 4));
  var bins = [...bin[0], ...bin[1], ...bin[2]];
  return [];
}
