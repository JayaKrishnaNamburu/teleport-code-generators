const { exec } = require('child_process')
const chalk = require('chalk')
const log = console.log

exec(`yarn ci`, { cwd: `packages/teleport-test/`}, (err, stdout, stderr) => {
	if (err) {
		log(chalk.red(err))
	} else {
		log(chalk.greenBright(stdout))
		log(chalk.greenBright(stderr))
	}
})