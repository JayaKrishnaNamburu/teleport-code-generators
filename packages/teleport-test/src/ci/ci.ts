// @ts-ignore
import { repo, sha } from 'ci-env'
import { readFileSync } from 'fs'
import { join } from 'path'
import { packProject } from '@teleporthq/teleport-code-generator'
import { ProjectUIDL, PackerOptions, ProjectType, PublisherType } from '@teleporthq/teleport-types'
import { addStatus } from './ci-utils'

import projectJSON from '../../../../examples/uidl-samples/project.json'

const token = process.env.COMMENT_USER_TOKEN

if (token) {
  addStatus(`Started Building Projects`, 'pending')
  const projectUIDL = (projectJSON as unknown) as ProjectUIDL
  const assetFile = readFileSync(join(__dirname, 'asset.png'))
  const base64File = new Buffer(assetFile).toString('base64')
  const packerOptions: PackerOptions = {
    publisher: PublisherType.CODESANDBOX,
    publishOptions: {
      outputPath: 'dist',
    },
    assets: [
      {
        type: 'png',
        name: 'icons-192',
        data: base64File,
      },
      {
        type: 'png',
        name: 'icons-512',
        data: base64File,
      },
    ],
  }

  const commentItems: any[] = []

  const run = async () => {
    addStatus(`Building Sandboxes`, 'pending')
    try {
      let result

      result = await packProject(projectUIDL, { ...packerOptions, projectType: ProjectType.REACT })
      console.info(ProjectType.REACT, '-', result.payload)
      commentItems.push({ flavor: ProjectType.REACT, sandbox: result.payload.split('/s')[1] })

      result = await packProject(projectUIDL, { ...packerOptions, projectType: ProjectType.VUE })
      console.info(ProjectType.VUE, '-', result.payload)
      commentItems.push({ flavor: ProjectType.VUE, sandbox: result.payload.split('/s')[1] })

      result = await packProject(projectUIDL, {
        ...packerOptions,
        projectType: ProjectType.STENCIL,
      })
      console.info(ProjectType.STENCIL, '-', result.payload)
      commentItems.push({ flavor: ProjectType.STENCIL, sandbox: result.payload.split('/s')[1] })

      result = await packProject(projectUIDL, {
        ...packerOptions,
        projectType: ProjectType.ANGULAR,
      })
      console.info(ProjectType.ANGULAR, '-', result.payload)
      commentItems.push({ flavor: ProjectType.ANGULAR, sandbox: result.payload.split('/s')[1] })

      let body = ''
      commentItems.forEach((item) => (body = `${body} ${item.sandbox}`))
      console.info(body)
      addStatus(`${body}`, 'success')
    } catch (e) {
      console.info(e)
      addStatus(`Failed in bulding Sandboxes`, 'failure')
    }
  }

  run()
} else {
  addStatus(`Token missing from CI`, 'error')
}
