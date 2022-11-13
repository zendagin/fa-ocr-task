<template>
  <div class="container">
    <div style="margin-right: 8px;">
      <div>
        <input ref="file" type="file" accept="application/pdf" @change="handleFileSelected" />
      </div>
      <div style="margin-bottom: 4px;">
        <button @click="onSubmit" :disabled="!fileSelected">submit</button>
      </div>

      <JobDetail v-if="selectedJob"></JobDetail>
    </div>

    <div>
      <h2>Jobs</h2>
      <div class="jobList">
        <JobCard class="jobCard" :class="{selected: selectedJobId === job.id}" v-for="job in ocrJobList" :ocr-job="job"
          @click="selectCard(job.id)">
        </JobCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {storeToRefs} from "pinia";
import {computed, onMounted, ref} from "vue";
import JobCard from "./components/JobCard.vue";
import JobDetail from "./components/JobDetail.vue";
import {OcrJobStatus, useOcrJobStore} from "./stores/ocrJob";
const file = ref<HTMLInputElement>();
const fileSelected = ref<File | null>(null);

const {
  fetchOcrJob,
  fetchOcrJobList,
  getOcrJob,
  createOcrJob,
} = useOcrJobStore();

const {ocrJobList, selectedJobId, selectedJob} = storeToRefs(useOcrJobStore());

fetchOcrJobList();

function handleFileSelected(evt: Event) {
  const el = evt.target as HTMLInputElement;
  fileSelected.value = el.files![0];
}

async function onSubmit() {
  const created = await createOcrJob(file.value!.files![0]);
  selectedJobId.value = created.id;
}

async function selectCard(id: number) {
  selectedJobId.value = id;
  if (selectedJob.value.status !== OcrJobStatus.DONE || !selectedJob.value.results) {
    await fetchOcrJob(id);
  }
}
</script>

<style>
.container {
  display: flex;
  align-content: space-around;
  width: 100%;
}

.jobCard {
  margin-top: 8px;
}

.jobCard.selected {
  background-color: rgba(200, 255, 200, 0.5);
}

.jobList {
  max-height: 800px;
  overflow-y: auto;
}
</style>