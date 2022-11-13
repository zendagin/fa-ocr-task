import {createDatabase} from 'typeorm-extension';
import {AppDataSource} from './data-source';

export async function initDatabase() {
    await createDatabase({ifNotExist: true});
    await AppDataSource.initialize();
}