import {getConnection} from "../configs/db.js";
import AppError from "../errors/AppError.js";

export default class DBService {
	static async query(sql, params) {
		try {
			const connection = await getConnection();
			try {
				return await connection.query(sql, params);
			} finally {
				connection.release();
			}
		} catch (error) {
			if (error.code === 'ER_GET_CONNECTION_TIMEOUT') {
				throw new AppError('Database connection was closed.', 500);
			}
			throw error;
		}
	}
}