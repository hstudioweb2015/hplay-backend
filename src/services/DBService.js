import {getConnection} from "../configs/db.js";
import AppError from "../errors/AppError.js";

export default class DBService {
	/**
	 * Executes a SQL query
	 * @param sql {string} - The SQL query to execute
	 * @param params {Array} - The parameters to bind to the query
	 * @param returnInsertId {boolean} - Whether to return the insert ID of the last inserted row
	 * @returns {Promise<*|number|bigint>} - The result of the query
	 */
	static async query(sql, params, returnInsertId = false) {
		try {
			const connection = await getConnection();
			try {
				const result = await connection.query(sql, params);
				if (returnInsertId) {
					return parseInt(result.insertId);
				} else {
					return result;
				}
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