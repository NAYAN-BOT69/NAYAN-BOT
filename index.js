/** 
 * @author NTKhang
 * ! The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using 
 */

const { spawn } = require("child_process");
const gradient = require("gradient-string");
const log = require("./logger/log.js");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

/**
 * @author NTKhang
 * English:
 * ! Please do not change the below code, it is very important for the project. It is my motivation to maintain and develop the project for free.
 * ! If you change it, you will be banned
 * * Thank you for using
 * 
 * Vietnamese:
 * ! Vui lòng không thay đổi mã bên dưới, nó rất quan trọng đối với dự án. Nó là động lực để tôi duy trì và phát triển dự án miễn phí.
 * ! Nếu thay đổi nó, bạn sẽ bị cấm
 * * Cảm ơn bạn đã sử dụng
 */


function centerText(text, length) {
	const width = process.stdout.columns;
	const leftPadding = Math.floor((width - (length || text.length)) / 2);
	const rightPadding = width - leftPadding - (length || text.length);
	// Build the padded string using the calculated padding values
	const paddedString = ' '.repeat(leftPadding > 0 ? leftPadding : 0) + text + ' '.repeat(rightPadding > 0 ? rightPadding : 0);
	// Print the padded string to the terminal
	console.log(paddedString);
}

const currentVersion = require("./package.json").version;

var _0x5f70=["\x2B\x2D\x2B\x2D\x2B\x2D\x2B\x2D\x2B\x2D\x2B\x20\x2B\x2D\x2B\x2D\x2B\x2D\x2B","\x7C\x4E\x7C\x41\x7C\x59\x7C\x41\x7C\x4E\x7C\x20\x7C\x42\x7C\x4F\x7C\x54\x7C","\x4E\x20\x41\x20\x59\x20\x41\x20\x4E\x20\x42\x20\x4F\x20\x54\x20\x20\x40\x20","","\x4E\x41\x59\x41\x4E\x42\x4F\x54\x20"];const titles=[[],[_0x5f70[0],_0x5f70[1],_0x5f70[0]],[`${_0x5f70[2]}${currentVersion}${_0x5f70[3]}`],[_0x5f70[4]]]
const maxWidth = process.stdout.columns;
const title = maxWidth > 58 ?
	titles[0] :
	maxWidth > 36 ?
		titles[1] :
		maxWidth > 26 ?
			titles[2] :
			titles[3];

for (const text of title) {
	const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
	centerText(textColor, text.length);
}
let subTitle = `Nayan @${currentVersion} - A simple Bot chat messenger use personal account`;
const subTitleArray = [];
if (subTitle.length > maxWidth) {
	while (subTitle.length > maxWidth) {
		let lastSpace = subTitle.slice(0, maxWidth).lastIndexOf(' ');
		lastSpace = lastSpace == -1 ? maxWidth : lastSpace;
		subTitleArray.push(subTitle.slice(0, lastSpace).trim());
		subTitle = subTitle.slice(lastSpace).trim();
	}
	subTitle ? subTitleArray.push(subTitle) : '';
}
else {
	subTitleArray.push(subTitle);
}
const author = 'Created by NTKhang';
const customize = 'customize by Nayan';
const srcUrl = 'Source code: https://github.com/NAYAN-BOT69/NAYAN-BOT';
for (const t of subTitleArray) {
	const textColor2 = gradient("#9F98E8", "#AFF6CF")(t);
	centerText(textColor2, t.length);
}
centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);
centerText(gradient("#9F98E8", "#AFF6CF")(customize), customize.length);
centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);


startProject();
