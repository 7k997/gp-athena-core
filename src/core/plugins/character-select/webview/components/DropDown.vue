<template>
  <div class="dropdown" v-if="options">

    <!-- Dropdown Input -->
    <input class="dropdown-input"
      :name="name"
      @keydown="handleKeyDown"
      @focus="showOptions()"
      @blur="exit()"
      @keyup="keyMonitor"
      v-model="searchFilter"
      :disabled="disabled"
      :placeholder="placeholder" />

    <!-- Dropdown Menu -->
    <div class="dropdown-content"
      v-show="optionsShown">
      <div
        class="dropdown-item"
        @mousedown="selectOption(option)"
        v-for="(option, index) in filteredOptions"
        :key="index"
        :class="{ 'selected': index === preselectedIndex }">
          {{ option.name || option.id || '-' }}
          
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Dropdown',
    template: 'Dropdown',
    props: {
      name: {
        type: String,
        required: false,
        default: 'dropdown',
        note: 'Input name'
      },
      options: {
        type: Array,
        required: true,
        default: [],
        note: 'Options of dropdown. An array of options with id and name',
      },
      placeholder: {
        type: String,
        required: false,
        default: 'Please select an option',
        note: 'Placeholder of dropdown'
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
        note: 'Disable the dropdown'
      },
      maxItem: {
        type: Number,
        required: false,
        default: 6,
        note: 'Max items showing'
      }
    },
    data() {
      return {
        selected: {},
        preselected: {},
        preselectedIndex: -1, // Index des vorselektierten Element
        optionsShown: false,
        searchFilter: ''
      }
    },
    created() {
      // this.$emit('selected', this.selected);
    },
    computed: {
      filteredOptions() {
        const filtered = [];
        const regOption = new RegExp(this.searchFilter, 'ig');
        for (const option of this.options) {
          if (this.searchFilter.length < 1 || option.name.match(regOption)){
            if (filtered.length < this.maxItem) filtered.push(option);
          }
        }
        return filtered;
      }
    },
    methods: {
      handleKeyDown(event) {
        if (this.optionsShown && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault();

          const currentIndex = this.filteredOptions.findIndex(option => option === this.preselected);
          let newIndex;

          if (event.key === 'ArrowUp') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : this.filteredOptions.length - 1;
          } else {
            newIndex = currentIndex < this.filteredOptions.length - 1 ? currentIndex + 1 : 0;
          }

          this.preselected = this.filteredOptions[newIndex];
          this.preselectedIndex = newIndex;
        }
      },
      selectOption(option) {
        this.selected = option;
        this.optionsShown = false;
        this.searchFilter = this.selected.name;
        this.$emit('selected', this.selected);
      },
      showOptions(){
        this.$emit('focus');
        if (!this.disabled) {
          this.searchFilter = '';
          this.optionsShown = true;
        }
      },
      exit() {
        this.$emit('blur');
        // if (!this.selected.id) {
        //   this.selected = {};
        //   this.searchFilter = '';
        // } else {
        //   this.searchFilter = this.selected.name;
        // }
        // this.$emit('selected', this.selected);
        // this.optionsShown = false;
      },
      // Selecting when pressing Enter
      keyMonitor: function(event) {
        if (event.key === 'Enter') {
          if (this.preselected) {
            this.selectOption(this.preselected);
          } else if (this.filteredOptions[0]) {
            this.selectOption(this.filteredOptions[0]);
          }
        }
      },
      // scrollIntoView(index) {
      //   // Scrollen Sie zum ausgewählten Element im Dropdown-Menü
      //   const dropdownMenu = this.$refs.dropdownMenu;
      //   if (dropdownMenu && index >= 0) {
      //     const selectedElement = dropdownMenu.children[index];
      //     if (selectedElement) {
      //       selectedElement.scrollIntoView({
      //         block: 'nearest',
      //       });
      //     }
      //   }
      // },
    },
    watch: {
      searchFilter() {
        if (this.filteredOptions.length === 0) {
          this.selected = {};
        } else {
          this.selected = this.filteredOptions[0];
        }
        this.$emit('filter', this.searchFilter);
      },
      // preselectedIndex(newIndex) {
      //   // Überwachen Sie den Index des vorselektierten Elements und scrollen Sie entsprechend
      //   this.scrollIntoView(newIndex);
      // },
    },
    

  };
</script>

<style lang="scss" scoped>
  .dropdown {
    
    position: relative;
    display: block;
    margin: auto;

    .dropdown-input {
      font-family: 'Permanent Marker', 'Roboto' !important;
      cursor: pointer;
      background-color: transparent;
      color: white;
      border: none; /* Keine Rahmenlinie */
      border-radius: 3px;
      display: block;
      font-size: 1em;
      padding: 6px;
      min-width: 150px;
      max-width: 150px;

      &:hover {
        // background: #555;
      }
    }

    .dropdown-content {
      position: absolute;
      min-width: 162px;
      max-width: 162px;
      max-height: 248px;
      border: none; /* Keine Rahmenlinie */
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2); /* Subtile Schattenlinie */
      overflow: auto;
      z-index: 1;

      .dropdown-item {
        font-size: .7em;
        line-height: 1em;
        padding: 8px;
        text-decoration: none;
        display: block;
        cursor: pointer;

        &:hover {
          background-color: #555;
        }

        &.selected {
          background-color: #777; // Hervorhebungsfarbe für das vorselektierte Element
        }

      }
    }

    .dropdown:hover .dropdown-content {
      display: block;
    }
  }
</style>

