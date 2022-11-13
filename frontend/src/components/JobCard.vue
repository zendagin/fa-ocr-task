<template>
  <div class="ocrJobCard">
    <table>
      <tr>
        <td>Job ID</td>
        <td>{{ ocrJob?.id}}</td>
      </tr>
      <tr>
        <td>Filename</td>
        <td>{{ ocrJob?.filename}}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>{{ ocrJob?.status}}</td>
      </tr>
      <tr>
        <td>CreatedAt</td>
        <td>{{ ocrJob?.createdAt}}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import type {PropType} from "vue";
import type {OcrJob} from "../stores/ocrJob";

const {ocrJob} = defineProps({
  ocrJob: Object as PropType<OcrJob>,
});
</script>

<style>
.ocrJobCard {
  padding: 8px;
  border-radius: 4px;
  border: solid #AAA 1px;
}
</style>