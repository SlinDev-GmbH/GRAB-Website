<script>
export default {

  props: {
    currentTab: String,
    isLoading: Boolean,
    currentValue: String,
  },

  methods: {
    applyFilter(filter) {
      if (this.isLoading) {
        return;
      }
      const previous = document.querySelector(".active-difficulty-filter");
      if (previous) {
        previous.classList.remove('active-difficulty-filter');
        if (previous.id == `filter-${filter}`) {
          this.$emit('filter', '');
          return;
        }
      }
      document.getElementById(`filter-${filter}`).classList.add('active-difficulty-filter');
      this.$emit('filter', filter)
    }
  },

  mounted() {
    // this.$emit('filter', '');
    if (this.currentValue) {
      document.getElementById(`filter-${this.currentValue}`).classList.add('active-difficulty-filter');
    }
  },

  emits: [
    'filter'
  ],
  
  // watch: {
  //   async currentTab(type) {
  //     const current = document.querySelector(".active-difficulty-filter");
  //     if (current) {
  //       current.classList.remove('active-difficulty-filter');
  //     }
  //   },
  // }
}
</script>


<template>
  <div class="difficulty-filter-container">
    <div class="filter" id="filter-unrated" @click="applyFilter('unrated')">unrated</div>
    <div class="filter" id="filter-easy" @click="applyFilter('easy')">easy</div>
    <div class="filter" id="filter-medium" @click="applyFilter('medium')">medium</div>
    <div class="filter" id="filter-hard" @click="applyFilter('hard')">hard</div>
    <div class="filter" id="filter-veryhard" @click="applyFilter('veryhard')">very hard</div>
    <div class="filter" id="filter-impossible" @click="applyFilter('impossible')">impossible</div>
  </div>
</template>


<style scoped>
.difficulty-filter-container {
  width: 100%;
  margin-top: 10px;
  border-radius: 10px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 7px;
  row-gap: 0;
  flex-wrap: wrap;
  padding-block: 4px;
}
.filter {
  padding: 0 5px;
  margin: 0 2px;
  border-radius: 5px;
  cursor: pointer;
}
.filter:hover {
  background-color: rgba(58, 170, 231, 0.4);
}
#filter-unrated {
  color: #969696;
}
#filter-easy {
  color: #2BBA84;
}
#filter-medium {
  color: #E1C800;
}
#filter-hard {
  color: #F19400;
}
#filter-veryhard {
  color: #EA0000;
}
#filter-impossible {
  color: #7f007f;
}
.active-difficulty-filter {
  background-color: rgba(58, 170, 231, 0.4);
}
</style>