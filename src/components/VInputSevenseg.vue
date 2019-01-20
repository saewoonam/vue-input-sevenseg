<template>
  <div
    :id="id"
    ref="digits"
    :style="style"
    class="sevenseg"
    :class="{ resize: resize, focus: focus}"
    tabindex="0"
    @click="mouse"
    @keydown="keydown"
  >
    <div :style="totalWidth">
      <div
        v-for="(color, index) in attributes"
        :id="index"
        :key="index"
        :value="color.digit"
        :style="divStyle"
        :class="{ blink: color.blink }"
      >
        <my-digit
          :value="color.digit"
          :dp="dp + padding == index"
          :color-on="color.on"
          :color-off="colorOff"
          :front="color.front"
          :back="color.back"
          :slant="slant"
        />
      </div>
    </div>
    <div>
      <!-- input :value="value" v-on:input="$emit('input', $event.target.value)" /-->
      <input
        v-model="value"
      >
    </div>
  </div>
</template>
<script>
import MyDigit from "./Digit.vue";

export default {
  components: {
    MyDigit
  },
  props: {
    id: {
      type: String,
      default: "id-placeholder"
    },
    init: {
      type: [String],
      default: "1.2345"
    },
    digits: {
      type: [String, Number],
      default: 4
    },
    step: {
      type: [String, Number],
      default: 1
    },
    precision: {
      type: [String, Number],
      default: undefined
    },
    width: {
      type: [String, Number],
      default: 400
    },
    height: {
      type: [String, Number],
      default: 100
    },
    colorBack: {
      type: String,
      default: "Black"
    },
    colorHigh: {
      type: String,
      default: "Green"
    },
    colorOn: {
      type: String,
      default: "Red"
    },
    colorOff: {
      type: String,
      default: "rgb(50, 0, 0)"
    },
    slant: {
      type: [String, Number],
      default: 0
    },
    resize: {
      type: [String, Boolean],
      default: false
    }
  },
  data() {
    return {
      digits_orig: ["1", "2", "", "4", "5"],
      value: 1.2345,
      readonly: false,
      mult: parseFloat(this.step),
      cursorPosition: 0, // this.digits,
      high: false,
      line: "",
      focus: false,
      lastValid: this.value
    };
  },
  computed: {
    divStyle: function() {
      return (
        "display: inline-block; height: 100%; " +
        "width: " +
        100 / this.attributes.length +
        "%;"
      );
    },
    attributes: function() {
      var colors = this.digitsArray.map(element => {
        return {
          digit: element,
          on: this.colorOn,
          off: this.colorOff,
          blink: this.high,
          back: "off",
          front: "off"
        };
      });
      return colors;
    },
    style: function() {
      var str = "display: inline-block; padding: 0.5em";
      str += "; width: " + "calc(" + this.width + "px - 1em)";
      str += "; height: " + "calc(" + this.height + "px - 1em)";
      str += "; background-color: " + this.colorBack;
      str += ";";
      return str;
    },
    raw: function() {
      // var isnum = /^-?\d*\.?\d*$/.test(this.value);
      var str;
      str = this.value.toString();
      // console.log('str', str, 'value', this.value);
      if (str.startsWith(".")) str = "0" + str;
      if (str.startsWith("-.")) str = str.replace("-", "-0");
      str = str.split("");
      return str;
    },
    digitsArray: function() {
      var temp = this.raw.slice(0);
      if (this.dp >= 0) {
        temp.splice(this.dp + 1, 1);
      }
      while (this.digits > 0 && temp.length < this.digits) {
        temp.unshift(" ");
      }
      if (this.digits > 0) {
        temp = temp.slice(0, this.digits);
      }
      return temp;
    },
    padding: function() {
      var padding = this.digits - this.raw.length;
      if (this.dp >= 0) padding += 1;
      return padding < 0 ? 0 : padding;
    },
    dp: function() {
      var dpLocation = this.raw.indexOf(".") - 1;
      if (dpLocation < 0) dpLocation = NaN;
      return dpLocation;
    },
    /*
    Firefox does not work like Chrome and Safari on right-justifying
    elements... So we need to specify widths for all elements
    */
    totalWidth: function() {
      var w = (((this.height - 16) * 6) / 8) * this.digits;
      var wMsg = "width: " + w + "px; float: right;";
      // console.log("totalWidth", wMsg);
      return wMsg;
    },
    numericValue: function() {
      return this.toPrecision(Number(this.value), this.precision);
    }
  },

  watch: {
    // Watch for init change, mostly to initial value to the value
    init: {
      immediate: true,
      // handle the changed value
      handler (val) {
        if (this.value != val) {
          console.log("watch: copy init to value");
          this.value = val
        }
      }
    },
  },
  mounted() {
    // this.$el.addEventListener("resize", this.handleResize);
  },
  destroyed() {
    // this.$el.removeEventListener("resize", this.handleResize);
  },
  methods: {
    // handleResize(event) {
    //   console.log("resize", event);
    // },
    /**
     * Function convert value to number
     * @param val
     * @returns {number | Number}
     */
    toNumber(val) {
      let num = parseFloat(val);
      if (isNaN(val) || !isFinite(val)) {
        num = 0;
      }
      return num;
    },
    /**
     * Function to return fixed decimal precision of input val
     * @param val
     * @param precision
     * @returns {number | Number}
     */
    toPrecision(val) {
      return this.precision !== undefined
        ? parseFloat(val.toFixed(this.precision))
        : val;
    },
    /**
     * Increment the current numeric value
     */
    increment() {
      console.log("increment");
      var step = this.mult * Number(this.step);
      if (!this.readonly)
        this.value = this.toPrecision(this.toNumber(this.value) + step);
      console.log("increment", typeof step, step);
      console.log("increment, this.modelValue:", typeof this.value, this.value);
    },
    /**
     * Decrement the current numeric value
     */
    decrement() {
      console.log("decrement");
      var step = this.mult * Number(this.step);
      if (!this.readonly)
        this.value = this.toPrecision(this.toNumber(this.value) - step);
    },
    /**
     *  Handle when the step multier needs to go up x10
     */
    multUp: function () {
        this.mult  = parseFloat(this.mult) * 10;
        // console.log('after '+this.multiplier);
    },
    /**
     *  Handle when the step multier needs to be divided by 10
     */
    multDown: function () {
        //  console.log('before '+this.multiplier);
        this.mult  = parseFloat(this.mult) / 10;
        if (this.mult*Number(this.step) < 10**(-this.precision)) {
            // console.log('mult is too small'+10**(-this.precision));
            this.mult = this.mult * 10;
            }
        // console.log('after '+this.multiplier);
    },
    mouse: function(event) {
      console.log("mouse: ", event);
    },
    keydown: function(evt) {
      console.log("keydown: ", evt);
      console.log("colors:", this.attributes);
      // console.log('keydown evt: ', evt, evt.shiftKey);
      // console.log('element', typeof(evt.target._value))
      // console.log('keydown evt.value: ', evt.value);

      switch (evt.key) {
        case "ArrowUp":
          if (evt.shiftKey) {
            this.multUp();
          } else {
            this.arrowUp(evt);
          }
          break;
        case "ArrowDown":
          if (evt.shiftKey) this.multDown();
          else this.arrowDown(evt);
          break;
        default:
          // console.log('default', evt.key)
          if (this.modelValue != this.value) {
            this.color = "red";
            this.isBack = true;
            this.focus = true;
          }
      }
      // console.log(this.value, typeof(this.value), this.outputValue, typeof(this.outputValue))
    },
    /**
     *  Handle when up arrow is pressed
     *  @param evt - event that triggered calling this function
     */
    arrowUp: function arrowUp(evt) {
      this.increment();
      if (evt) {
        this.moveCursor(evt);
      }
      this.handleTimeout(700);
    },
    /**
     *  Handle when down arrow is pressed
     *  @param evt - event that triggered calling this function
     */
    arrowDown: function arrowDown(evt) {
      this.decrement();
      if (evt) {
        this.moveCursor(evt);
      }
      this.handleTimeout(700);
    },
    /**
     *  Handle timeouts wait "delay" amount of time before timing out
     *  @param {Number} delay
     */
    handleTimeout(delay) {
      this.focus = true
      clearTimeout(this.timeout);
      this.timeout = setTimeout( () => {
        this.focus = false;
        this.$emit('change', this.value)
        this.lastValid = this.value
      }, delay);
    },
    moveCursor: function(evt) {
      console.log("moveCursor not implemented: evt:", evt);
    },
  }
};
</script>
<style scoped>
.partial {
  fill-opacity: 0.2;
}
@keyframes blink {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0;
  }
  75% {
    opacity: 1;
  }
}

.blink {
  animation: blink 0.35s infinite;
}
.resize {
  resize: both;
  overflow: auto;
}

.sevenseg.focus  {
  outline: 5px solid orange;
  transition: 0.2s;
}

</style>
