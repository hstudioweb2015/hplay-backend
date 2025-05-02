import app from './app.js';
import {port} from './configs/config.js';

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});