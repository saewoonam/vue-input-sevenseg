<template>
  <div id="app">
    <v-input-sevenseg v-model="value1"></v-input-sevenseg>
    <br />
    <p>value1: {{ value1 }}</p>
    <br />
    <v-input-sevenseg v-model="value2" digits=10 height=60 slant=25 />
    <br />
    <p>value2: {{ value2 }}</p>
    <v-input-sevenseg v-model="value3"
      digits=4
      precision=2
      @change="logChange(value3)"
    >
    </v-input-sevenseg>
    <br />
    <p>value3: {{ value3 }}</p>
  </div>
</template>

<script>
import VInputSevenseg from "./components/VInputSevenseg.vue";

export default {
  name: "app",
  components: {
    VInputSevenseg
  },
  data() {
    return {
      value1: 1.2,
      value2: "0.123456789",
      value3: 0.345
    };
  },
  methods: {
    logChange: function(value) {
      console.log("logChange:", value);
    }
  }
};
</script>

<style>
#app {
  display: inline-block;
}
</style>
