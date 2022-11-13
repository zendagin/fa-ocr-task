import {ref, computed} from 'vue';
import {defineStore} from 'pinia';

export enum OcrJobStatus {
    CONVERT = "convert",
    OCR = "ocr",
    DONE = "done",
    ERROR = "error",
}

export interface OcrJob {
    id: number,
    filename: string,
    status: OcrJobStatus,
    createdAt: string,
    pageNum: number,
    results?: OcrJobResult[];
}

export interface OcrJobResult {
    result: any;
}

export const useOcrJobStore = defineStore('ocrJob', {
    state: () => {
        return {
            ocrJobList: [] as OcrJob[],
            ocrJobDict: {} as Record<string, OcrJob>,
            selectedJobId: 0
        };
    },
    getters: {
        selectedJob: (state) => state.ocrJobDict[state.selectedJobId]
    },
    actions: {
        saveJob(ocrJob: OcrJob) {
            if (this.ocrJobDict[ocrJob.id]) {
                Object.assign(this.ocrJobDict[ocrJob.id], ocrJob);
            } else {
                this.ocrJobList.unshift(ocrJob);
                this.ocrJobDict[ocrJob.id] = ocrJob;
            }
        },
        async fetchOcrJob(id: number) {
            const res = await fetch(import.meta.env.VITE_API_PREFIX + `/ocr-jobs/${id}`);
            const {ocrJob}: {ocrJob: OcrJob;} = await res.json();
            this.saveJob(ocrJob);
        },
        async fetchOcrJobList() {
            const res = await fetch(import.meta.env.VITE_API_PREFIX + '/ocr-jobs');
            const data = await res.json();
            this.ocrJobList = data.ocrJobs;
            this.ocrJobDict = {};
            this.ocrJobList.forEach(job => {
                this.ocrJobDict[job.id] = job;
            });
        },
        getOcrJob(id: number) {
            console.log(id, this.ocrJobDict)
            return this.ocrJobDict[id];
        },
        async createOcrJob(file: File) {
            const form = new FormData();
            form.append("file", file);

            const res = await fetch(import.meta.env.VITE_API_PREFIX + '/ocr-jobs', {
                method: 'post',
                body: form,
            });

            const data = await res.json();
            this.saveJob(data.ocrJob);
            return data.ocrJob;
        }
    },
});
