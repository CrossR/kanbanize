const { query } = require('../graphql')
const {
  graphqlClient,
  addProjectCard,
  moveProjectCard,
  baseVariables
} = require('../lib/github')

module.exports = async (payload) => {
  const { issue: { number }, label: { name } } = payload
  const variables =  Object.assign({}, baseVariables, {
    number, projectName: name
  })

  const [issue, project] = await Promise.all([
      graphqlClient.request(query.findIssue, variables),
      graphqlClient.request(query.findProject, variables)
  ])

  const label = issue.repository.issue.labels.edges
    .find(label => label.node.name === name)

  const { description } = label.node

  if (description.length < 6) {
      return
  }

  if (description.substring(0, 7).toLowerCase() === "project") {
      await addProjectCard({ label, project, issue, variables })
      return
  }

  if (description.substring(0, 6).toLowerCase() === "status") {
      await moveProjectCard({ label, issue, variables })
      return
  }
}
