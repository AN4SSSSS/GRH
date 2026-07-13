function nomRouteParDefaut(role) {
  if (role === 'manager') return 'validations'
  if (role === 'rh-admin') return 'rh-admin-dashboard'
  return 'dashboard'
}

export { nomRouteParDefaut }
