import app from './app.js';
import {port} from './configs/config.js';
import {connectDB} from './configs/db.js';

connectDB();

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});