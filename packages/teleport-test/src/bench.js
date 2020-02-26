
const { createReactProjectGenerator, ReactTemplate } = require('@teleporthq/teleport-project-generator-react')
const { createZipPublisher } = require('@teleporthq/teleport-publisher-zip')
const { createProjectPacker } = require('@teleporthq/teleport-project-packer')
const projectJSON = require('../../../examples/uidl-samples/project.json')

const run = async () => {
	try {
		const start = process.hrtime.bigint()
		
		const reactPacker = createProjectPacker()
		reactPacker.setTemplate(ReactTemplate)
		reactPacker.setGenerator(createReactProjectGenerator())
		reactPacker.setPublisher(createZipPublisher())
		await reactPacker.pack(projectJSON)
	
		const end = process.hrtime.bigint()
		const timeElapsed = Math.round(Number(end - start) / 1e6)
		if (timeElapsed > 500) {
			throw new Error(`Failed in passing benchmarking, observed - ${timeElapsed}`)		
		}
		console.log(`Time elapsed for cold start for  react ${timeElapsed}`)

	} catch(e) {
		throw new Error(e)
	}

	let warmRuns = 0
	const startRuns = process.hrtime.bigint()
	for(i = 0; i<10; i++) {
		try {
			const start = process.hrtime.bigint()
			
			const reactPacker = createProjectPacker()
			reactPacker.setTemplate(ReactTemplate)
			reactPacker.setGenerator(createReactProjectGenerator())
			reactPacker.setPublisher(createZipPublisher())
			await reactPacker.pack(projectJSON)
		
			const end = process.hrtime.bigint()
			const timeElapsed = Math.round(Number(end - start) / 1e6)
			console.log(`Time elapsed for react for ${i}th run ${timeElapsed}`)
			warmRuns = warmRuns + timeElapsed
		} catch(e) {
			throw new Error(e)
		}
	}
	const endRuns = process.hrtime.bigint()
	const timeSpent = Math.round(Number(endRuns - startRuns)/1e6)
	console.log(`Total time taken for running 10 runs is ${timeSpent}`)
	console.log(`Average time in warm runs ${timeSpent / 10}`)
}

run()