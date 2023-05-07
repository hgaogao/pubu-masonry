<script lang="ts" setup>
defineProps({
  src: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <img :src="src" class="itemClass" alt="">
</template>

<style>
.itemClass  {
  width: 100%;
}
</style>
