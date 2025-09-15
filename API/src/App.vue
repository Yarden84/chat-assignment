<template>
  <div class="container">
    <article class="readme" v-html="html"></article>
  </div>
</template>

<script setup lang="ts">
import README from "../README.md?raw";
import { marked } from "marked";
import { computed } from "vue";

const html = computed(() => marked.parse(README));
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.readme {
  line-height: 1.6;
}
.readme pre {
  overflow: auto;
}
.readme code {
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}
</style>
