module.exports = {
  getmain: function (req, res) {
    res.render('index');
  },
  getinput: function (req, res) {
    //User Input
    var fsign = req.body.inputSign
    var finput = parseFloat(req.body.inputFloat);
    var exp = parseInt(req.body.inputExp);
    var exists = true;
    console.log(fsign)
    console.log(finput);
    console.log(exp);

    var sign = fsign
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

    console.log('step 1 done')

    var eprime = decToBin(398 + exp, 10);
    var cf = getcf(dec[0], eprime);
    var econt = eprime.slice(2, 10);
    var cc = getCoefficientCont(dec);
    var dpbcd = getDensePackBCD(cc);

    var step2 = new Step({
      num: 2,
      process: "Get e'",
      result: exp.toString() + ' + 398 = ' + (exp + 398)
    });

    console.log('step 2 done')

    var step3 = new Step({
      num: 3,
      process: "Get Combination Field",
      result: cf.join('')
    });

    var step3b = new Step({
      num: 3,
      process: "Get E' Continuation",
      result: econt.join('')
    });

    // Just for printing the coefficien cont
    let ccString = []
    for(k=0; k<60; k+=4)
    {
      ccString = ccString.concat(cc.slice(k, k+4))
      ccString = ccString.concat(' ')
    }
    ccString = ccString.join('').replace(/,/g, '')

    var step4 = new Step({
      num: 4,
      process: "Get Coefficient Continuation",
      result: ccString
    });

    console.log('step 4 done')

    let dpString = []
    for(k=0; k<5; k++)
    {
      dpString = dpString.concat(dpbcd.slice(k*10, k*10+3))
      dpString = dpString.concat(' ')
      dpString = dpString.concat(dpbcd.slice(k*10+3, k*10+6))
      dpString = dpString.concat(' ')
      dpString = dpString.concat(dpbcd.slice(k*10+6, k*10+10))
      dpString = dpString.concat(' ')
    }
    dpString = dpString.join('').replace(/,/g, '')

    //===================================================================
    // Step 5
    var step5 = new Step({
      num: 5,
      process: "Convert Coefficient Continuation to Densely-Packed BCD",
      result: dpString
    })

    //===================================================================
    // Summary
    cf = cf.join('').replace(/,/g, '')
    econt = econt.join('').replace(/,/g, '')

    var summary = new Summary({
      sign: sign,
      cf: cf,
      econt: econt,
      dense: dpString
    })

    var nums = [sign, ...cf, ...econt];
    console.log('Sign, CF, Econt: ' + nums);

    for (i = 0; i < nums.length; i += 4) {
      //console.log(binToHex(nums.slice(i, i + 4)));
    }

    const steps = { step1, step2, step3, step4, step5 };

    const sum = {summary}

    res.render('index', {
      finput: parseFloat(req.body.inputFloat),
      exists: exists,
      expinput: parseFloat(req.body.inputExp),
      binary: dec.join(''), // temp (not result)
      hex: binToHex(dec), // temp (not result)
      steps: steps,
      summary: sum
    });
  }
};

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
function getWX(aei, packed)
{
  let aeiStr = aei.toString().replace(/,/g, '')
  let pq = ''
  
  if(aeiStr == '000' )
  {
    pq = pq.concat(packed[9], packed[10])
    return pq
  }
  else if(aeiStr == '001' )
    return '00'
  else if(aeiStr =='010')
    return '01'
  else if(aeiStr =='100')
    return '10'
  else
    return '11'
}

function getPQ(aei, packed)
{
  let aeiStr = aei.toString().replace(/,/g, '')
  let pq = ''

  if(aeiStr.charAt(0) == '0')
    pq = pq.concat(packed[1], packed[2])
  else if(aeiStr == '100' || aeiStr =='110')
    pq = pq.concat(packed[9], packed[10])
  else if(aeiStr == '101')
    pq = pq.concat(packed[5], packed[6])
  else
    return '00'

  return pq
}

function getST(aei, packed, count)
{
  let aeiStr = aei.toString().replace(/,/g, '')
  pq = ''

  if(count == 0 || count == 1)
  {
    if(aeiStr == '001' || aeiStr =='100' || aeiStr == '000')
      pq = pq.concat(packed[5], packed[6])
    else
      pq = pq.concat(packed[9], packed[10])
  }
  else if(count == 2)
  {
    if(aeiStr == '110' )
      return '00'
    else if(aeiStr =='101')
      return '01'
    else (aeiStr =='011')
      return '10'
  }
  else
      return '11'

  return pq
}

function getDensePackBCD(cc)
{
  let final = []
  let packed
  let dense = new Array(10)
  let AEI_count1
  let aei
  let wx
  let pq
  let st

  for(x=0; x<5; x++)
  {
    aei = []
    packed = cc.slice(x*12, (x+1)*12)
    aei.push(packed[0])
    aei.push(packed[4])
    aei.push(packed[8])
    console.log('AEI: ' + aei)

    dense[2] = packed[3] // r = d
    dense[5] = packed[7] // u = h
    dense[9] = packed[11] // y = m

    AEI_count1 = (aei.toString().match(/1/g) || []).length // count no. of 1s in AEI

    if(AEI_count1 > 0)
      dense[6] = 1
    else 
      dense[6] = 0
      
    wx = getWX(aei, packed)
    pq = getPQ(aei, packed)
    st = getST(aei, packed, AEI_count1)
    dense[0] = pq.charAt(0)
    dense[1] = pq.charAt(1)
    dense[3] = st.charAt(0)
    dense[4] = st.charAt(1)
    dense[7] = wx.charAt(0)
    dense[8] = wx.charAt(1)
    
    //console.log('pqr: ' + dense[0] + dense[1] + dense[2])
    //console.log('stu: ' +dense[3] + dense[4] + dense[5])
    //console.log('vwxy: ' +dense[6] + dense[7] + dense[8] + dense[9])

    final = final.concat(dense)
  }

  return final
}

function getCoefficientCont(decArr){
  console.log(decArr.length)
  let arr = []
  
  for(j=1; j<decArr.length; j++)
  {
    arr = arr.concat(decToBin(decArr[j], 4))
  }
  console.log(arr)
  return arr
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
