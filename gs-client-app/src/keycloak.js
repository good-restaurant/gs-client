import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'https://sso.i4624.info',
  realm: 'i4624sso',
  clientId: 'good-restaurant-web'
})

export default keycloak
export { keycloak }

