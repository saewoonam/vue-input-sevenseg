<template>
  <div id="app"><v-input-sevenseg init=1.234567></v-input-sevenseg></div>
</template>

<script>
import VInputSevenseg from "./components/VInputSevenseg.vue";

export default {
  name: "app",
  components: {
    VInputSevenseg
  }
};
</script>

<style>
#app {
  display: inline-block;
}
</style>
