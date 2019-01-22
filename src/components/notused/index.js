import Vue from "vue";
import VInputSevenseg from "./VInputSevenseg.vue";

const Components = {
  VInputSevenseg
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;
