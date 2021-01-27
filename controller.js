module.exports = {
  getmain: function (req, res) {
    res.render('index');
  },
  getinput: function (req, res) {
    var sign = req.body.inputSign;
    var finput = Math.abs(parseFloat(req.body.inputFloat));
    var exp = isNaN(parseInt(req.body.inputExp))
      ? 0
      : parseInt(req.body.inputExp);
    var rounding = parseInt(req.body.inputRound);
    var exists = true;
    var isnan = false;
    var isinf = false;
    var isdenorm = false;

    /** STEP 1: Get sign bit **/
    var step1 = new Step({
      num: 1,
      process: 'Get sign bit',
      result:
        sign == 0
          ? 'Since the number is positive, sign bit is 0.'
          : 'Since the number is negative, sign bit is 1.'
    });

    if (isNaN(finput)) {
      finput = 0;
      isnan = true;
    }

    /** STEP 2: Normalize finput **/
    while (finput % 1 != 0 && finput / Math.pow(10, 16) < 1) {
      finput *= 10;
      exp--;
    }
    let tempf = finput;
    while (tempf >= Math.pow(10, 16)) {
      tempf /= 10;
      exp++;
    }

    if (exp > 384) {
      finput = 0;
      isinf = true;
    }
    if (exp < -383) {
      isdenorm = true;
    }

    var finput16;
    if (rounding == 0) {
      let rtnte = Number(finput.toPrecision(16));
      finput16 = rtnte.toString().replace('.', '').slice(0, 16);
    } else if (rounding == 1) {
      if (sign == 0) finput16 = ceiling(finput.toString());
      else finput16 = finput.toString().slice(0, 16);
    } else if (rounding == 2) {
      if (sign == 1) finput16 = ceiling(finput.toString());
      else finput16 = finput.toString().slice(0, 16);
    } else {
      finput16 = finput.toString().slice(0, 16);
    }

    var temp = finput16.split('');
    while (temp[temp.length - 1] == 0) temp.pop();
    let dec = new Array(16).fill(0);
    for (let i = 0; i < temp.length; i++)
      dec[16 - temp.length + i] = parseInt(temp[i]);

    var step2 = new Step({
      num: 2,
      process: 'Normalize to 16 decimal digits',
      result: dec.join('') + ' x10^' + exp
    });

    /** STEP 3: Get e' **/
    var eprime = decToBin(398 + exp, 10);
    var step3 = new Step({
      num: 3,
      process: "Get e'",
      result:
        exp.toString() +
        ' + 398 = ' +
        (exp + 398) +
        ' (' +
        eprime.join('') +
        ')'
    });

    /** STEP 4: Get combination field **/
    var cf = getCf(dec[0], eprime, isnan, isinf);
    var step4 = new Step({
      num: 4,
      process: 'Get combination field',
      result: cf.join('')
    });

    /** STEP 4.1: Get e continuation **/
    var econt = eprime.slice(2, 10);
    if (isnan || isinf) econt = econt.fill(1);
    if (isdenorm) econt = econt.fill(0);
    var step4b = new Step({
      num: 4.1,
      process: "Get e' continuation",
      result: econt.join('')
    });

    /** STEP 5: Get coefficient continuation **/
    var cc = getCoefficientCont(dec);
    let ccString = [];
    for (k = 0; k < 60; k += 4) {
      ccString = ccString.concat(cc.slice(k, k + 4));
      ccString = ccString.concat(' ');
    }
    ccString = ccString.join('').replace(/,/g, '');

    var step5 = new Step({
      num: 5,
      process: 'Get coefficient continuation',
      result: ccString
    });

    /** STEP 5: Convert coefficient continuation to densely packed bcd **/
    var dpbcd = getDensePackBCD(cc);

    let dpString = [];
    for (k = 0; k < 5; k++) {
      dpString = dpString.concat(dpbcd.slice(k * 10, k * 10 + 3));
      dpString = dpString.concat(dpbcd.slice(k * 10 + 3, k * 10 + 6));
      dpString = dpString.concat(dpbcd.slice(k * 10 + 6, k * 10 + 10) + ' ');
    }
    dpString = dpString.join('').replace(/,/g, '');

    var step6 = new Step({
      num: 6,
      process: 'Convert coefficient continuation to densely-packed BCD',
      result: dpString
    });

    cf = cf.join('').replace(/,/g, '');
    econt = econt.join('').replace(/,/g, '');

    const steps = { step1, step2, step3, step4, step4b, step5, step6 };

    let finalBinary = '';
    finalBinary = finalBinary.concat(sign);
    finalBinary = finalBinary.concat(cf);
    finalBinary = finalBinary.concat(econt);
    finalBinary = finalBinary.concat(dpString);
    finalBinary = finalBinary.replace(/ /g, '');

    res.render('index', {
      finput: isNaN(parseInt(req.body.inputFloat))
        ? parseInt(req.body.inputFloat)
        : req.body.inputFloat,
      expinput: isNaN(parseInt(req.body.inputExp))
        ? 0
        : parseInt(req.body.inputExp),
      hex: binToHex(finalBinary),
      hidden: finalBinary,
      exists: exists,
      sign: sign,
      cf: cf,
      econt: econt,
      dense: dpString,
      steps: steps
    });
  }
};

function Step({ num, process, result }) {
  this.num = num;
  this.process = process;
  this.result = result;
}

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
  let arr = [];
  for (j = 1; j < decArr.length; j++) {
    arr = arr.concat(decToBin(decArr[j], 4));
  }
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

function getCf(msd, eprime, isnan, isinf) {
  var a = new Array(5);
  if (isnan) {
    a = a.fill(1);
    return a;
  } else if (isinf) {
    a = a.fill(1);
    a[4] = 0;
    return a;
  }

  if (msd < 8) {
    a = decToBin(msd, 5);
    a[0] = eprime[0];
    a[1] = eprime[1];
  } else {
    a = [1, 1, eprime[0], eprime[1], 0];
    a[4] = msd == 8 ? 0 : 1;
  }
  return a;
}

function binToHex(binaryString) {
  var output = '';
  for (var i = 0; i < binaryString.length; i += 4) {
    var bytes = binaryString.substr(i, 4);
    var decimal = parseInt(bytes, 2);
    var hex = decimal.toString(16);
    output += hex.toUpperCase();
  }
  return output;
}

function ceiling(num) {
  let ceiling = num.toString();
  let offset = new Array(ceiling.length - 16).fill('0').join('');
  let ceilingstr = ceiling.toString().replace('.', '');
  ceilingstr = ceilingstr.slice(0, 16).concat(offset);
  var rem =
    parseFloat(ceiling.slice(15, num.length + 1)) -
      parseFloat(ceilingstr.slice(15, num.length + 1)) ==
    0
      ? false
      : true;
  let ceilingarr = ceilingstr.slice(0, 16).split('');
  if (rem) {
    ceilingarr[15] = parseInt(ceilingarr[15]) + 1;
  }
  return ceilingarr.join('').slice(0, 16);
}
