<script setup lang="ts">
import { onMounted  } from "vue";
import Masonry from "masonry-layout";
onMounted(async () => {
  var masonryEl = document.querySelector('.masonry');
  const masonry = new Masonry(".masonry", {
    columnWidth: ".column",
    itemSelector: ".column",
    gutter: 10,
  });
  const computedWidth = () => {
    const masonryEl:HTMLElement | null = document.querySelector(":root .masonry");
    const clientWidth = document.body.clientWidth;
    const columnSize = Math.floor(clientWidth / 300);
    const gutterWidth = 10 * (columnSize - 1);
    const columnWidth = (clientWidth - gutterWidth) / columnSize;
    masonryEl?.style.setProperty("--column-width", `${columnWidth}px`);
    console.log("123");
  };
  window.addEventListener("resize", computedWidth);
 
  computedWidth();
  masonry.layout &&masonry.layout();

  setInterval(() => {
    const Element = document.createElement("div");
    Element.classList.add("column");
    Element.innerText = "123";
    var fragment = document.createDocumentFragment();
    const fgEl = fragment.appendChild(Element);
    masonryEl?.appendChild(fgEl);
    masonry.appended && masonry.appended( [Element] )
  },2000)
});
</script>

<template>
  <div class="masonry">
    <div class="column">
      1233
    </div>
  </div>
</template>

<style>
.masonry {
  background-color: #456;
  width: 100%;
}
:root .masonry {
  --column-width: 300px;
}
.column {
  /* transition: width 0.5s; */
  background-color: #987;
  height: 500px;
  width: var(--column-width);
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
</style>
