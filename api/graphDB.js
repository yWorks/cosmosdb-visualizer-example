const gremlin = require('gremlin')

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
require('dotenv').config()

class GraphDB {
  constructor() {
    const authenticator = new gremlin.driver.auth.PlainTextSaslAuthenticator(
      `/dbs/${process.env.Database}/colls/${process.env.Container}`,
      process.env.Key
    )
    this.g = gremlin.process
      .traversal()
      .withRemote(new DriverRemoteConnection(process.env.GremlinEndpoint, { authenticator }))
    this.client = new gremlin.driver.Client(process.env.GremlinEndpoint, {
      authenticator,
      traversalsource: 'g',
      rejectUnauthorized: true,
      mimeType: 'application/vnd.gremlin-v2.0+json'
    })
  }

  async states() {
    await this.client.open()
    const result = await this.client.submit("g.V().has('name', 'state')")
    await this.client.close()
    const items = result['_items']

    return items.map(item => {
      const {
        id,
        label,
        properties: {
          capacity: [{ value: capacity }]
        }
      } = item
      return { id, label, capacity }
    })
  }

  async transitions() {
    await this.client.open()
    const result = await this.client.submit(
      "g.V().as('from').outE('transition').as('transitions').inV().as('to').select('from','transitions','to').by('id').by().by('id')"
    )
    await this.client.close()
    const items = result['_items']

    return items.map(item => {
      const {
        from,
        transitions: {
          properties: { time, endTime }
        },
        to
      } = item
      return { from, to, time, endTime }
    })
  }
}

module.exports = GraphDB
