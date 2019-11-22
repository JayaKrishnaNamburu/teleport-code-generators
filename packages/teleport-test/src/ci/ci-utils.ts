// @ts-ignore
import { repo, sha, event, pull_request_number, branch } from 'ci-env'
import fetch from 'cross-fetch'

export const comment = (commentItems: any[]) => {
  const token = process.env.COMMENT_USER_TOKEN
  if (!token) {
    throw new Error('Access token required for comments on the PR')
  }

  if (repo && sha && event === 'pull_request') {
    const issueNumber = pull_request_number ? pull_request_number : branch.split('/')[2]
    commentService(issueNumber, commentItems, token)
  } else {
    throw new Error('Unable to detect env details, make sure it is running in CI env')
  }
}

const commentService = async (issueNumber: number, commentItems: any[], token: string) => {
  try {
    let body = ''
    commentItems.forEach((item) => (body = `${body} [${item.flavor}](${item.sandbox}) &nbsp;`))
    const url = `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`
    const data = {
      body,
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      },
      body: JSON.stringify(data),
    })
    const status = await response.json()
    if (status) {
      console.info('commented successfully')
    }
  } catch (e) {
    console.info('error', e)
  }
}

type STATUS = 'success' | 'error' | 'failure' | 'pending'

export const addStatus = async (message: string, status: STATUS) => {
  const token = process.env.COMMENT_USER_TOKEN
  const url = `https://api.github.com/repos/${repo}/statuses/${sha}`
  const data = {
    state: status,
    description: message,
    context: 'ci-bot',
  }
  const response = fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    body: JSON.stringify(data),
  })
  response
    .then((res) => res.json())
    .then((responseJSON) => {
      console.info('Status updated')
    })
    .catch((err) => {
      console.info(err)
      process.exit(0)
    })
}
