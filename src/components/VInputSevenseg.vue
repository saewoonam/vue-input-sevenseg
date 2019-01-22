<template>
  <div
    :id="id"
    ref="digits"
    :style="style"
    class="sevenseg"
    :class="{ resize: resize, focus: focus }"
    tabindex="0"
    @click="mouse"
    @keydown="keydown"
    @change="onChange"
    @input="onInput"
  >
    <div :style="totalWidth">
      <div
        v-for="(color, index) in attributes"
        :id="index"
        :key="index"
        :value="color.digit"
        :style="divStyle"
      >
        <my-digit
          :class="{ blinkfill: stepPosition == index && blink }"
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
      <input :value="value" type="hidden" />
    </div>
  </div>
</template>
<script>
import Digit from "./Digit.vue";

export default {
  name: "v-input-sevenseg",
  components: {
    "my-digit": Digit
  },
  model: {
    prop: "init",
    event: "input"
  },
  props: {
    id: {
      type: String,
      default: "id-placeholder"
    },
    init: {
      type: [String, Number],
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
      value: "1.2345",
      readonly: false,
      mult: parseFloat(this.step),
      screenPosition: this.digits, // location to insert into string/number
      blink: false,
      line: "",
      focus: false,
      lastValid: this.value,
      hasDP: true
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
          blink: false,
          back: "off",
          front: "off"
        };
      });
      // console.log("attributes screenPosition, insertPosition", this.screenPosition, this.insertPosition);
      // console.log("attributes stepPosition", this.stepPosition);
      if (this.screenPosition >= this.padding) {
        if (this.screenPosition == this.digits) {
          colors[this.screenPosition - 1].back = "on";
        } else {
          colors[this.screenPosition].front = "on";
        }
      }
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
      // console.log("raw", this.value, typeof this.value);
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
    },
    insertPosition: function() {
      var pos = this.screenPosition - this.padding;
      if (pos < 0) pos = 0;
      if (this.raw.indexOf(".") <= pos && this.raw.indexOf(".") >= 0) {
        pos++;
      }
      // console.log('calc insert screen padding', this.screenPosition, this.padding, pos);
      return pos;
    },
    stepPosition: function() {
      var pos =
        this.dp + this.padding - Math.round(Math.log10(parseFloat(this.mult)));
      return pos;
    }
  },

  watch: {
    // Watch for init change, mostly to initial value to the value
    init: {
      immediate: true,
      // handle the changed value
      handler(val) {
        if (this.value != val) {
          // console.log("copy init to value");
          if (typeof val == "number") this.value = val.toString();
          else this.value = val;
          this.hasDP = this.value.includes(".");
          this.value = this.toPrecision(Number(this.value)).toString();
        }
      }
    }
  },
  mounted() {
    this.$el.addEventListener("mousewheel", this.handleWheel);
    this.$el.addEventListener("wheel", this.handleWheel); // for IE
    /*
    console.log("this.$el", this.$el);
    console.log("this.$el.attributes", this.$el.attributes);
    console.log("this.$attrs", this.$attrs);
    console.log("this.$parent", this.$parent);
    console.log("this.$options", this.$options);
    console.log("this.$listeners", this.$listeners)
    */
  },
  destroyed() {
    this.$el.removeEventListener("mousewheel", this.handleWheel);
    this.$el.removeEventListener("wheel", this.handleWheel); // for IE
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
    toPrecision(value) {
      var val = value;
      if (typeof val == "string") {
        val = Number(val);
      }
      return this.precision !== undefined
        ? parseFloat(val.toFixed(this.precision))
        : parseFloat(val.toFixed(15));
    },
    /**
     * Function to convert the numeric value to a string
     * @value
     *
     */
    toString(value) {
      var temp = value.toString();
      // console.log("toString, value", value, typeof value, !temp.includes("."));
      if (this.hasDP) {
        if (!temp.includes(".")) {
          // console.log("add .");
          temp += ".";
        }
      }
      // console.log("toString return:", temp);
      return temp;
    },
    /**
     * Increment the current numeric value
     */
    increment() {
      var step = this.mult * Number(this.step);
      this.value = this.toPrecision(this.toNumber(this.value) + step);
      this.value = this.toString(this.value);
    },
    /**
     * Decrement the current numeric value
     */
    decrement() {
      var step = this.mult * Number(this.step);
      this.value = this.toPrecision(this.toNumber(this.value) - step);
      this.value = this.toString(this.value);
    },
    /**
     *  Handle when the step multier needs to go up x10
     */
    multUp: function() {
      this.mult = parseFloat(this.mult) * 10;
      // console.log('after '+this.multiplier);
    },
    /**
     *  Handle when the step multier needs to be divided by 10
     */
    multDown: function() {
      //  console.log('before '+this.multiplier);
      this.mult = parseFloat(this.mult) / 10;
      if (this.mult * Number(this.step) < 10 ** -this.precision) {
        // console.log('mult is too small' + 10 ** (-this.precision));
        this.mult = this.mult * 10;
      }
      // console.log('after '+this.multiplier);
    },
    mouse: function(event) {
      var path = event.path || (event.composedPath && event.composedPath());
      // console.log("mouse, screenPosition", this.screenPosition);
      // console.log("mouse: path", path);
      if (path) {
        for (let entry of path) {
          if ("id" in entry)
            if ("value" in entry.attributes)
              if (entry.nodeName == "DIV") {
                // console.log(entry.nodeName, entry.id, this.screenPosition);
                let temp = parseInt(entry.id) + 1;
                if (temp >= this.padding) this.screenPosition = temp;
              }
        }
      }
    },
    /**
     *  Handle mouse wheel events
     *  @param {object} event
     */
    handleWheel(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) {
        this.decrement();
      } else if (e.deltaY > 0) {
        this.increment();
      }
      this.handleTimeout(200);
    },
    keydown: function(evt) {
      // console.log("keydown: ", evt);
      // console.log("colors:", this.attributes);
      // console.log('keydown evt: ', evt, evt.shiftKey);
      // console.log('element', typeof(evt.target._value))
      // console.log('keydown evt.value: ', evt.value);
      var addTimeout = false;
      if (evt.code == "ArrowLeft") {
        if (this.screenPosition > 0 && this.screenPosition > this.padding) {
          this.screenPosition--;
        }
      } else if (evt.code == "ArrowRight") {
        this.screenPosition++;
        // console.log("ArrowRight", this.raw, this.raw.length);
        if (this.screenPosition > this.digits) {
          this.screenPosition--;
        }
      } else if (evt.keyCode == 68 && evt.ctrlKey) {
        if (this.screenPosition >= this.padding) {
          let temp = this.raw.slice();
          // console.log('ctrl-d', this.insertPosition, this.screenPosition);
          let deleted = temp.splice(this.insertPosition, 1);
          if (deleted == ".") this.hasDP = false;
          // console.log('ctrl-d', temp);
          this.value = parseFloat(temp.join(""));
          this.value = this.toString(this.value);
          if (this.padding > 0) this.screenPosition += 1;
          addTimeout = true;
        }
      } else if (evt.code == "Backspace") {
        if (this.screenPosition > this.padding) {
          let temp = this.raw.slice();
          // console.log('backspace before', this.insertPosition, this.screenPosition, this.padding);
          let removed = temp.splice(this.insertPosition - 1, 1);
          if (removed == ".") this.hasDP = false;
          // console.log('backspace temp after remove', temp);
          this.value = parseFloat(temp.join(""));
          this.value = this.toString(this.value);
          // console.log('backspace after', this.insertPosition, this.screenPosition, this.padding);
          if (removed != "." && this.padding == 0)
            this.screenPosition--;
          addTimeout = true;
          // console.log('backspace after', this.insertPosition, this.screenPosition, this.padding);
        }
      }
      if (
        (evt.keyCode >= 48 && evt.keyCode <= 57) ||
        (evt.keyCode >= 96 && evt.keyCode <= 105)
      ) {
        let temp = this.raw.slice();
        temp.splice(this.insertPosition, 0, evt.key);
        this.value = parseFloat(temp.join(""));
        this.value = this.toString(this.value);
        addTimeout = true;
      }
      if (evt.key == "." && this.raw.indexOf(".") == -1) {
        this.hasDP = true; // make sure we keep the decimal point
        // console.log('insert .');
        let temp = this.raw.slice();
        temp.splice(this.insertPosition, 0, evt.key);
        this.value = parseFloat(temp.join(""));
        this.value = this.toString(this.value);
        addTimeout = true;
      }
      switch (evt.key) {
        case "ArrowUp":
          this.blink = true;
          if (evt.shiftKey) {
            this.multUp();
          } else {
            this.arrowUp(evt);
          }
          break;
        case "ArrowDown":
          this.blink = true;
          if (evt.shiftKey) this.multDown();
          else this.arrowDown(evt);
          break;
        case "ArrowLeft":
          break;
        case "ArrowRight":
          break;
        // default:
        //   console.log('default', evt.key, evt.keyCode, evt)
      }
      if (addTimeout) this.handleTimeout(1000);
      // console.log(this.value, typeof(this.value), this.outputValue, typeof(this.outputValue))
    },
    /**
     *  Handle when up arrow is pressed
     *  @param evt - event that triggered calling this function
     */
    arrowUp: function arrowUp(evt) {
      this.increment();
      this.handleTimeout(700);
    },
    /**
     *  Handle when down arrow is pressed
     *  @param evt - event that triggered calling this function
     */
    arrowDown: function arrowDown(evt) {
      this.decrement();
      this.handleTimeout(700);
    },
    /**
     *  Handle timeouts wait "delay" amount of time before timing out
     *  @param {Number} delay
     */
    handleTimeout(delay) {
      this.focus = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.focus = false;
        this.blink = false;
        this.onInput();
        this.onChange();
        this.lastValid = this.value;
      }, delay);
    },
    /**
     * On change event trigger on input
     * @param event
     */
    onChange (event) {
      // console.log('builtin onChange, id', this.id, 'event', event);
      this.$emit("change", this.value)
    },
    onInput (event) {
      // console.log("builtin on div input", this.id, 'event', event);
      // this.$emit('input', event.target.value);
      this.$emit("input", this.value);
    },
    moveCursor: function(evt) {
      console.log("moveCursor not implemented: evt:", evt);
    }
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
