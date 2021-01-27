# IEEE-754 Decimal-64 Floating Point Simulator

This application is deployed here: https://csarch2-decimal64-simulator.herokuapp.com/

## Overview

This application was created as one of the requirements for CSARCH2. It allows users to convert a decimal value into its IEEE-754 Decimal-64 Floating Point equivalent.

## How to use

### Input: Decimal and base-10 (i.e., 127.0x105) and NaN

- This applcation takes four(4) values as input:

  1. Sign (+, -)
  2. Significand (A floating point number)
  3. Exponent (An integer)
  4. Rounding Method (RTN-TE, Round up, Round down, Truncate)

  _Note that by default, sign is positive, and the rounding method is RTN-TE._

- If the significand field is empty, then it is _NaN_.
- If the exponent field is empty, then it is _0_.
- Floating point numbers in the exponent field are parsed into integers.

### Output: binary output with space as well as its hexadecimal equivalent

- After submitting the inputs, the steps for conversion are shown to the user.
- The binary output, as well as its hexadecimal equivalent are shown as well.
- The user is given the option to save the binary and hex output to a file _'Decimal64.txt'_

### Installation

```
npm install
```

### Run the application

```
npm run start
```

Tech Stack:\
_Node.js, Express, Handlebars_

Hosted on:\
_Heroku_
