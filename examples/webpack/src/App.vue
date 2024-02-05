<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">MainTestPage</RouterLink>
        <RouterLink to="/dose">DoseTestPage</RouterLink>
        <RouterLink to="/drag">DragTestPage</RouterLink>
        <RouterLink to="/fusion">FusionTestPage</RouterLink>
        <RouterLink to="/segmentation">SegmentationPage</RouterLink>
      </nav>
    </div>
  </header>

  <!-- <RouterView /> -->

  <router-view v-slot="{ Component, route }">
    <keep-alive>
      <component :is="Component" :key="route.path" />
    </keep-alive>
  </router-view>
</template>

<style scoped>
.wrapper {
  font-size: 32px;
  font-weight: lighter;
  width: 1649px;
  margin: 10px auto 20px;
}

.wrapper a {
  color: #efefef;
  margin-right: 10px;
}
</style>
