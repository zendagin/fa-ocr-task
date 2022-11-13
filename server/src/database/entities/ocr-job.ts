import {Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from "typeorm";
import {faApiVersion} from "../../fa-api";

export enum OcrJobStatus {
    CONVERT = "convert",
    OCR = "ocr",
    DONE = "done",
    ERROR = "error",
}

@Entity()
export class OcrJob {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: OcrJobStatus,
        default: OcrJobStatus.CONVERT,
    })
    status: OcrJobStatus;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @Column()
    filename: string;

    @Column()
    sha256: string;

    @Column({default: faApiVersion()})
    faApiVersion: string;

    @Column({default: ""})
    faConvertJobId: string;

    @Column({default: ""})
    faReceiptJobId: string;

    @Column({default: 0})
    pageNum: number;

    @OneToMany(() => OcrJobResult, (jobRes) => jobRes.ocrJob)
    results: OcrJobResult[];
}

@Entity()
export class OcrJobResult {
    @PrimaryColumn()
    lid: string;

    @Column()
    imageIdx: number;

    @Column({default: false})
    done: boolean;

    @Column("simple-json")
    result: any;

    @ManyToOne(() => OcrJob, (job) => job.results)
    ocrJob: OcrJob;
}
