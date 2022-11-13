<template>
    <div class="ocrJobCard">
        <table>
            <tr>
                <td>Job ID</td>
                <td>{{ selectedJob?.id}}</td>
            </tr>
            <tr>
                <td>Filename</td>
                <td>{{ selectedJob?.filename}}</td>
            </tr>
            <tr>
                <td>Status</td>
                <td>{{ selectedJob?.status}}</td>
            </tr>
            <tr>
                <td>CreatedAt</td>
                <td>{{ selectedJob?.createdAt}}</td>
            </tr>
            <tr v-if="selectedJob?.results">
                <td>Result</td>
                <td>
                    <div class="resultArea">
                        {{ JSON.stringify(selectedJob?.results, null, 2)}}
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>
  
<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useOcrJobStore} from "@/stores/ocrJob";
import type {PropType} from "vue";
const {
    selectedJob
} = storeToRefs(useOcrJobStore());
</script>
  
<style>
.ocrJobCard {
    padding: 8px;
    border-radius: 4px;
    border: solid #AAA 1px;
}

.resultArea {
    white-space: pre-wrap;
    overflow-y: auto;
    max-height: 500px;
}
</style>