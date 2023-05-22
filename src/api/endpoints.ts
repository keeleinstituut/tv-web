export const endpoints = {
  ROLES: `${process.env.REACT_APP_AUTHORIZATION_API}roles`,
  INSTITUTIONS: `${process.env.REACT_APP_AUTHORIZATION_API}institutions`,
  PRIVILEGES: `${process.env.REACT_APP_AUTHORIZATION_API}privileges`,
}

export const authEndpoints = {
  TOKEN: `realms/${process.env.REACT_APP_KEYCLOAK_realm}/protocol/openid-connect/token`,
}
