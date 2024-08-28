<template>
  <div class="dropdown">
    <button @click="toggleDropdown" class="dropdown-button">
      <slot name="button-content">{{selection}}</slot>
    </button>
    <div v-if="isOpen" class="dropdown-content">
      <div
        v-for="option in options"
        :key="option"
        class="dropdown-item"
        @click="selectOption(option)"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
      selection: undefined
    };
  },
  created(){
      this.selection = this.defaultChoice
  },
  props:{
      options: {
          type:Array,
          required:true
      },
      defaultChoice:{
          type:String,
          required:true
      }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectOption(option) {
      this.selection = option
      this.isOpen = false
      this.$emit("changeSelection", this.selection);
    },
  },
};
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  padding: 8px 40px;
  cursor: pointer;
  background-color: #4641be;
  color: white;
  border: none;
  border-radius: 15px;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  background-color: #322e8b;
  color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  right: 0;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  background-color: #3f3cab;
  width: 100%;
  border-radius: 10px;
}

.dropdown-item:hover {
  background-color: #322e8b;
}
</style>
