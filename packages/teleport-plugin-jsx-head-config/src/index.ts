import { ComponentPluginFactory, ComponentPlugin } from '@teleporthq/teleport-types'
import {
  createJSXTag,
  createSelfClosingJSXTag,
} from '@teleporthq/teleport-shared/dist/cjs/builders/ast-builders'
import * as types from '@babel/types'
import { addChildJSXText } from '@teleporthq/teleport-shared/dist/cjs/utils/ast-jsx-utils'
import { addAttributeToJSXTag } from '@teleporthq/teleport-shared/src/utils/ast-jsx-utils'

interface JSXHeadPluginConfig {
  componentChunkName?: string
  configTagIdentifier?: string
  configTagDependencyPath?: string
}

export const createPlugin: ComponentPluginFactory<JSXHeadPluginConfig> = (config) => {
  const {
    componentChunkName = 'jsx-component',
    configTagIdentifier = 'Helmet',
    configTagDependencyPath = 'react-helmet',
  } = config || {}

  const propTypesPlugin: ComponentPlugin = async (structure) => {
    const { uidl, chunks, dependencies } = structure

    const componentChunk = chunks.find((chunk) => chunk.name === componentChunkName)
    if (!componentChunk) {
      throw new Error(
        `JSX component chunk with name ${componentChunkName} was required and not found.`
      )
    }

    const headASTTags = []

    if (uidl.meta && uidl.meta.title) {
      const titleAST = createJSXTag('title')
      addChildJSXText(titleAST, uidl.meta.title)
      headASTTags.push(titleAST)
    }

    if (uidl.meta && uidl.meta.metaTags) {
      uidl.meta.metaTags.forEach((tag) => {
        const metaAST = createSelfClosingJSXTag('meta')
        Object.keys(tag).forEach((key) => {
          addAttributeToJSXTag(metaAST, key, tag[key])
        })
        headASTTags.push(metaAST)
      })
    }

    if (headASTTags.length > 0) {
      const headConfigTag = createJSXTag(configTagIdentifier, headASTTags)

      const rootKey = uidl.node.content.key
      const rootElement = componentChunk.meta.nodesLookup[rootKey] as types.JSXElement

      // Head config added as the first child of the root element
      rootElement.children.unshift(headConfigTag)

      dependencies[configTagIdentifier] = {
        type: 'library',
        path: configTagDependencyPath,
      }
    }

    return structure
  }

  return propTypesPlugin
}

export default createPlugin()