<script setup lang="ts">
import { eventTarget } from "@cornerstonejs/core";
import { CONSTANT } from "our-medical";
import { RouterLink, RouterView } from "vue-router";

import type { Types } from "our-medical";

eventTarget.addEventListener(
  CONSTANT.Events.VOI_MODIFIED_FROM_TOOL,
  (arg: Types.EventTypes.VoiModifiedFromToolEvent) => {
    console.log(arg);
  }
);
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Main</RouterLink>
        <RouterLink to="/drag">Drag</RouterLink>
        <RouterLink to="/fusion">fusion</RouterLink>
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
  font-size: 28px;
  font-weight: lighter;
  width: 1649px;
  margin: 10px auto 10px;
}

.wrapper a {
  color: #efefef;
  margin-right: 10px;
}
</style>
