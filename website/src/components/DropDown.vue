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
        this.selection = option;
        this.isOpen = false;
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
    padding: 10px 20px;
    cursor: pointer;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
  }
  
  .dropdown-content {
    display: block;
    position: absolute;
    background-color: white;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  
  .dropdown-item {
    padding: 12px 16px;
    cursor: pointer;
  }
  
  .dropdown-item:hover {
    background-color: #f1f1f1;
  }
  </style>
  