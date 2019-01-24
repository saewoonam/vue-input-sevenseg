# vue-input-sevenseg

## Vue input numeric input component that uses a a Seven Segment Display

### Compile UMD javascript library that can be included in <script> on a web page
```
yarn build-lib
```

### Compile example vue app that uses the component
```
yarn serve
```
## Project setup (have not checked if this works)
```
npm install --save vue-input-sevenseg
```

### Usage

Look in the files ex1.html, ex2.html or ex_ff.html for firefox for examples.

Example of parameters for component:

```
<v-sevenseg model-v=".34" color-back="transparent" color-on="green" color-off="rgb(255, 240, 255)" height=80 digits=7 slant=10></v-sevenseg>
```

`value` or `:value`
- Any Number between 0-9 in String format. Default is "8"
- Use `:value={myValue}` to bind `value` prop to `myValue`

`color-on`
- String. Default is `Red`.
- Color when a segment is on

`:color-off`
- String. Default is `rgb(50, 0, 0)`
- Color when a segment is off
  
`color-back`
- String. Default is `Black`
- Color for the box/background of the display

`height`
- Number. Default is `100`
- Height in pixels of a box the includes the display.

`width`
- Number. Default is `400`
- Width in pixels of a box the includes the display.

`digits`
- Number. Default is `4`
- Number of digits in the display

`slant`
- Number. Default is 0
- Degrees slant of the digits in the display

### Caveat

This is my first vue project.  Any suggestions to improve the code is welcome.

### Based on code and instructions from

- <https://github.com/BrandonLWhite/sevenSeg.js>
- <https://github.com/z0h4n/vue-seven-segment-display>
- <https://medium.com/justfrontendthings/how-to-create-and-publish-your-own-vuejs-component-library-on-npm-using-vue-cli-28e60943eed3>
- <https://vuejsdevelopers.com/2018/05/21/vue-js-web-component/>
