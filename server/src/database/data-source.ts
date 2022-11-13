import {DataSource} from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "fa-task",
    synchronize: true,
    logging: false,
    entities: ["src/database/entities/**/*.ts"],
    subscribers: [],
    migrations: [],
});