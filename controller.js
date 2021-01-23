module.exports = {
  getmain: function (req, res) {
    res.render('index');
  },
  getinput: function (req, res) {
    //User Input
    var fsign = req.body.inputSign;
    var finput = Math.abs(parseFloat(req.body.inputFloat));
    var exp = parseInt(req.body.inputExp);
    var sign = fsign;
    var exists = true;
    console.log(fsign);
    console.log(finput);
    console.log(exp);

    if (isNaN(finput)) finput = 0;
    if (isNaN(exp)) exp = 0;

    while (finput % 1 != 0) {
      finput *= 10;
      if (finput / Math.pow(10, 16) < 1) {
        exp -= 1;
      }
      console.log(finput / Math.pow(10, 16));
    }
    console.log(finput);

    var temp = finput.toString().split('');
    temp = temp.splice(0, 16);
    while (temp[temp.length - 1] == 0) {
      temp.pop();
    }
    console.log('temp: ' + temp + '   ' + temp.length);
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
    console.log('eprime: ' + eprime);
    var cf = getCf(dec[0], eprime);
    console.log(cf);
    var econt = eprime.slice(2, 10);
    console.log(econt);
    var cc = getCoefficientCont(dec);
    var dpbcd = getDensePackBCD(cc);

    var step2 = new Step({
      num: 2,
      process: "Get e'",
      result: exp.toString() + ' + 398 = ' + (exp + 398)
    });

    console.log('step 2 done');

    var step3 = new Step({
      num: 3,
      process: 'Get Sign Bit',
      result:
        sign == 0
          ? 'Since the number is positive, sign bit is 0'
          : 'Since the number is negative, sign bit is 1'
    });

    var step4 = new Step({
      num: 4,
      process: 'Get Combination Field',
      result: cf.join('')
    });

    var step4b = new Step({
      num: 4.1,
      process: "Get E' Continuation",
      result: econt.join('')
    });

    // Just for printing the coefficien cont
    let ccString = [];
    for (k = 0; k < 60; k += 4) {
      ccString = ccString.concat(cc.slice(k, k + 4));
      ccString = ccString.concat(' ');
    }
    ccString = ccString.join('').replace(/,/g, '');

    var step5 = new Step({
      num: 5,
      process: 'Get Coefficient Continuation',
      result: ccString
    });

    console.log('step 5 done');

    let dpString = [];
    for (k = 0; k < 5; k++) {
      dpString = dpString.concat(dpbcd.slice(k * 10, k * 10 + 3));
      dpString = dpString.concat(' ');
      dpString = dpString.concat(dpbcd.slice(k * 10 + 3, k * 10 + 6));
      dpString = dpString.concat(' ');
      dpString = dpString.concat(dpbcd.slice(k * 10 + 6, k * 10 + 10));
      dpString = dpString.concat(' ');
    }
    dpString = dpString.join('').replace(/,/g, '');

    //===================================================================
    // Step 5
    var step6 = new Step({
      num: 6,
      process: 'Convert Coefficient Continuation to Densely-Packed BCD',
      result: dpString
    });

    //===================================================================
    // Summary Display
    cf = cf.join('').replace(/,/g, '');
    econt = econt.join('').replace(/,/g, '');

    //===================================================================
    // RENDER
    const steps = { step1, step2, step3, step4, step4b, step5, step6 };

    var nums = [sign, ...cf, ...econt];
    console.log('Sign, CF, Econt: ' + nums);

    let finalBinary = '';
    finalBinary = finalBinary.concat(sign);
    finalBinary = finalBinary.concat(cf);
    finalBinary = finalBinary.concat(econt);
    finalBinary = finalBinary.concat(dpString);
    finalBinary = finalBinary.replace(/ /g, '');

    res.render('index', {
      finput: isNaN(parseFloat(req.body.inputFloat)) ? 0 : req.body.inputFloat,
      exists: exists,
      expinput: isNaN(parseInt(req.body.inputExp)) ? 0 : req.body.inputExp,
      hex: binToHex(finalBinary),
      steps: steps,
      sign: sign,
      cf: cf,
      econt: econt,
      dense: dpString
    });
  }
};

//=====================================================
//Functions
//Constuctor for Step
function Step({ num, process, result }) {
  this.num = num;
  this.process = process;
  this.result = result;
}

//Constuctor for Summary
function Summary({ sign, cf, econt, dense }) {
  this.sign = sign;
  this.cf = cf;
  this.econt = econt;
  this.dense = dense;
}

// =========================================================
// subfunctions for Densely Packed BCD
function getWX(aei, packed) {
  let aeiStr = aei.toString().replace(/,/g, '');
  let pq = '';

  if (aeiStr == '000') {
    pq = pq.concat(packed[9], packed[10]);
    return pq;
  } else if (aeiStr == '001') return '00';
  else if (aeiStr == '010') return '01';
  else if (aeiStr == '100') return '10';
  else return '11';
}

function getPQ(aei, packed) {
  let aeiStr = aei.toString().replace(/,/g, '');
  let pq = '';

  if (aeiStr.charAt(0) == '0') pq = pq.concat(packed[1], packed[2]);
  else if (aeiStr == '100' || aeiStr == '110')
    pq = pq.concat(packed[9], packed[10]);
  else if (aeiStr == '101') pq = pq.concat(packed[5], packed[6]);
  else return '00';

  return pq;
}

function getST(aei, packed, count) {
  let aeiStr = aei.toString().replace(/,/g, '');
  pq = '';

  if (count == 0 || count == 1) {
    if (aeiStr == '001' || aeiStr == '100' || aeiStr == '000')
      pq = pq.concat(packed[5], packed[6]);
    else pq = pq.concat(packed[9], packed[10]);
  } else if (count == 2) {
    if (aeiStr == '110') return '00';
    else if (aeiStr == '101') return '01';
    else if (aeiStr == '011') return '10';
  } else return '11';

  return pq;
}

function getDensePackBCD(cc) {
  let final = [];
  let packed;
  let dense = new Array(10);
  let AEI_count1;
  let aei;
  let wx;
  let pq;
  let st;

  for (x = 0; x < 5; x++) {
    aei = [];
    packed = cc.slice(x * 12, (x + 1) * 12);
    aei.push(packed[0]);
    aei.push(packed[4]);
    aei.push(packed[8]);
    console.log('AEI: ' + aei);

    dense[2] = packed[3]; // r = d
    dense[5] = packed[7]; // u = h
    dense[9] = packed[11]; // y = m

    AEI_count1 = (aei.toString().match(/1/g) || []).length; // count no. of 1s in AEI

    if (AEI_count1 > 0) dense[6] = 1;
    else dense[6] = 0;

    wx = getWX(aei, packed);
    pq = getPQ(aei, packed);
    st = getST(aei, packed, AEI_count1);
    dense[0] = pq.charAt(0);
    dense[1] = pq.charAt(1);
    dense[3] = st.charAt(0);
    dense[4] = st.charAt(1);
    dense[7] = wx.charAt(0);
    dense[8] = wx.charAt(1);

    final = final.concat(dense);
  }

  return final;
}

function getCoefficientCont(decArr) {
  console.log(decArr.length);
  let arr = [];

  for (j = 1; j < decArr.length; j++) {
    arr = arr.concat(decToBin(decArr[j], 4));
  }
  console.log(arr);
  return arr;
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

function getCf(msd, eprime) {
  var a = new Array(5);
  if (msd < 8) {
    a = decToBin(msd, 5);
    a[0] = eprime[0];
    a[1] = eprime[1];
  } else {
    a[0] = 1;
    a[1] = 1;
    a[2] = eprime[0];
    a[3] = eprime[1];
    a[4] = msd == 8 ? 0 : 1;
  }
  return a;
}

function binToHex(binaryString) {
  var output = '';

  // For every 4 bits in the binary string
  for (var i = 0; i < binaryString.length; i += 4) {
    // Grab a chunk of 4 bits
    var bytes = binaryString.substr(i, 4);

    // Convert to decimal then hexadecimal
    var decimal = parseInt(bytes, 2);
    var hex = decimal.toString(16);

    // Uppercase all the letters and append to output
    output += hex.toUpperCase();
  }

  return output;
}
